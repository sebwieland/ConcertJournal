package com.ConcertJournalAPI;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Account self-service (export / password change / deletion) and the 422 validation contract, full context. */
@SpringBootTest
@AutoConfigureMockMvc
class AccountIntegrationTest {

    private static final String PASSWORD = "initial-password";

    @Autowired
    private MockMvc mockMvc;

    private Cookie xsrf;
    private String email;

    @BeforeEach
    void registerFreshUser() throws Exception {
        xsrf = mockMvc.perform(get("/api/get-xsrf-cookie")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(xsrf);
        email = "user-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/register").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\",\"firstName\":\"Ada\",\"lastName\":\"L\"}"))
                .andExpect(status().isCreated());
    }

    private MvcResult login(String password) throws Exception {
        return mockMvc.perform(post("/login").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                .param("email", email).param("password", password)).andReturn();
    }

    private String accessToken(MvcResult login) throws Exception {
        return JsonPath.read(login.getResponse().getContentAsString(), "$.accessToken");
    }

    private String createEvent(String token, String json) throws Exception {
        return mockMvc.perform(post("/api/event").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void exportContainsProfileAndOwnEventsButNoSecrets() throws Exception {
        String token = accessToken(login(PASSWORD));
        createEvent(token, "{\"bandName\":\"Export Band\",\"date\":\"2026-05-01\",\"rating\":4,\"place\":\"Hall\"}");

        mockMvc.perform(get("/api/me/export").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("concertjournal-export.json")))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.firstName").value("Ada"))
                .andExpect(jsonPath("$.events", hasSize(1)))
                .andExpect(jsonPath("$.events[0].bandName").value("Export Band"))
                .andExpect(jsonPath("$.events[0].date").value("2026-05-01"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.role").doesNotExist())
                .andExpect(jsonPath("$.events[0].appUser").doesNotExist());
    }

    @Test
    void changePasswordRequiresCurrentPasswordAndTakesEffect() throws Exception {
        String token = accessToken(login(PASSWORD));

        mockMvc.perform(put("/api/me/password").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"brand-new-password\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.currentPassword").value("Password is incorrect."));

        mockMvc.perform(put("/api/me/password").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"" + PASSWORD + "\",\"newPassword\":\"short\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.newPassword").value("New password must be at least 8 characters."));

        mockMvc.perform(put("/api/me/password").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"" + PASSWORD + "\",\"newPassword\":\"brand-new-password\"}"))
                .andExpect(status().isNoContent());

        assertEquals(401, login(PASSWORD).getResponse().getStatus(), "old password must stop working");
        assertEquals(200, login("brand-new-password").getResponse().getStatus());
    }

    @Test
    void deleteAccountRemovesUserEventsAndSession() throws Exception {
        MvcResult login = login(PASSWORD);
        String token = accessToken(login);
        Cookie refresh = login.getResponse().getCookie("refreshToken");
        createEvent(token, "{\"bandName\":\"Gone Band\",\"date\":\"2026-05-01\",\"rating\":3}");

        mockMvc.perform(delete("/api/me").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"wrong\"}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.password").exists());

        MvcResult deleted = mockMvc.perform(delete("/api/me").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isNoContent())
                .andReturn();
        Cookie cleared = deleted.getResponse().getCookie("refreshToken");
        assertNotNull(cleared);
        assertEquals(0, cleared.getMaxAge(), "refresh cookie must be expired");

        // The still-unexpired access token no longer resolves to a user
        mockMvc.perform(get("/api/allEvents").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        // A refresh cookie kept on another device can't mint new access tokens
        mockMvc.perform(post("/api/refresh-token").cookie(xsrf, refresh).header("X-XSRF-TOKEN", xsrf.getValue()))
                .andExpect(status().isBadRequest());
        assertEquals(401, login(PASSWORD).getResponse().getStatus());
    }

    @Test
    void invalidEventIs422WithFieldErrors() throws Exception {
        String token = accessToken(login(PASSWORD));

        mockMvc.perform(post("/api/event").cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue())
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bandName\":\"\",\"date\":\"2026-05-01\",\"rating\":9}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.errors.bandName").value("Band Name is required."))
                .andExpect(jsonPath("$.errors.rating").value("Rating must be at most 5"))
                .andExpect(jsonPath("$.message").isString());
    }
}
