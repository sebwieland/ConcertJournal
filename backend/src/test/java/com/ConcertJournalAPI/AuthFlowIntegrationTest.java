package com.ConcertJournalAPI;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end auth journey through the real filter chain, Flyway-migrated H2
 * and Jackson — the server-side half of the browser e2e, runnable without a
 * socket. Guards framework upgrades (Boot 4: Security 7 matchers, Jackson 3
 * date format, Flyway auto-configuration module).
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginThenUseApiThenRefresh() throws Exception {
        // CSRF bootstrap — the SPA echoes the raw cookie value as X-XSRF-TOKEN
        Cookie xsrf = mockMvc.perform(get("/api/get-xsrf-cookie"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf, "XSRF-TOKEN cookie must be issued");

        // Form login with the DataLoader admin seeded into the migrated schema
        MvcResult login = mockMvc.perform(post("/login")
                        .cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .param("email", "admin@example.com")
                        .param("password", "password"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andReturn();
        String accessToken = com.jayway.jsonpath.JsonPath.read(
                login.getResponse().getContentAsString(), "$.accessToken");
        Cookie refresh = login.getResponse().getCookie("refreshToken");
        assertNotNull(refresh, "refresh token cookie must be set on login");

        // Owner-scoped data; dates are ISO strings on the wire, owner never leaks
        mockMvc.perform(get("/api/allEvents").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[0].date", matchesPattern("\\d{4}-\\d{2}-\\d{2}")))
                .andExpect(jsonPath("$[0].appUser").doesNotExist());

        mockMvc.perform(get("/api/event/999999").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        // A refresh token must not work as a Bearer access token (typ claim)
        mockMvc.perform(get("/api/allEvents").header("Authorization", "Bearer " + refresh.getValue()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/refresh-token")
                        .cookie(xsrf, refresh).header("X-XSRF-TOKEN", xsrf.getValue()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        Cookie xsrf = mockMvc.perform(get("/api/get-xsrf-cookie"))
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);

        mockMvc.perform(post("/login")
                        .cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .param("email", "admin@example.com")
                        .param("password", "wrong"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void openApiDocsAreServed() throws Exception {
        // springdoc 3 is the Boot 4 line; 2.x fails at runtime, not compile time
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").isString());
    }
}
