package com.ConcertJournalAPI.configuration;

import com.ConcertJournalAPI.controller.BandEventController;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.service.BandEventService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.logout;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = BandEventController.class)
@AutoConfigureMockMvc
@Import({PasswordConfig.class, SecurityConfiguration.class})
public class SecurityConfigurationTest {

    private static final String TEST_USERNAME = "admin@example.com";
    private static final String TEST_PASSWORD = "password";
    private static final String TEST_ROLE = "USER";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private BandEventService bandEventService;

    @MockBean
    private AppUserRepository appUserRepository;

    @Test
    @WithMockUser(username = TEST_USERNAME, roles = TEST_ROLE)
    public void testAuthorizedAccessToEventEndpoint() throws Exception {
        mockMvc.perform(get("/api/allEvents"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithAnonymousUser
    public void testUnauthorizedAccessToEventsEndpoint() throws Exception {
        // API clients receive a JSON 401 instead of a login redirect
        mockMvc.perform(get("/api/allEvents"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithAnonymousUser
    public void testSpaDocumentRoutesServeAnonymously() throws Exception {
        // Regression: E2E smoke found /sign-up bounced to the Thymeleaf /login
        // fallback in the unified container because the route matched no
        // permitAll rule. SPA document routes must reach SpaController.
        // (Static index.html may 404 in this lightweight MVC slice — what
        // matters is that authorization neither redirects nor denies.)
        mockMvc.perform(get("/sign-up"))
                .andExpect(status().isNotFound());
        // The domain root must be mapped to the SPA as well (Whitelabel 404
        // otherwise), not guarded by authorization.
        mockMvc.perform(get("/"))
                .andExpect(status().isNotFound());
        // Two-segment SPA routes (React Router path params) must reach the
        // SPA too — otherwise they fall through to denyAll and the browser
        // lands on the backend login form instead of the client router.
        mockMvc.perform(get("/edit-entry/11"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithAnonymousUser
    public void testRefreshTokenEndpointPassesAuthorizationAnonymously() throws Exception {
        // Regression: E2E smoke found the post-login bounce to /sign-in —
        // the SPA silently authenticated via the cookie must be able to call
        // POST /api/refresh-token without a Bearer header. Authorisation must
        // let it through (invalid/absent cookie → controller 400, security
        // entrypoint 401 would mean the endpoint is wrongly guarded);
        // CSRF still applies via the filtered chain. The MVC slice only
        // registers BandEventController, so reaching "no handler"/404 proves
        // authorization passed and the security entrypoint did not fire.
        mockMvc.perform(post("/api/refresh-token").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCsrfProtection() throws Exception {
        mockMvc.perform(post("/api/allEvents")
                        .with(csrf().useInvalidToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testPasswordHashing() {
        // Create a new user with a password
        AppUser user = new AppUser();
        user.setPassword(TEST_PASSWORD);

        // Hash the password
        String hashedPassword = passwordEncoder.encode(user.getPassword());

        // Verify that the hashed password is not equal to the original password
        Assertions.assertNotEquals(user.getPassword(), hashedPassword);

        // Verify that the hashed password can be matched with the original password
        Assertions.assertTrue(passwordEncoder.matches(user.getPassword(), hashedPassword));
    }

    @Test
    @WithMockUser(username = TEST_USERNAME, roles = TEST_ROLE)
    public void testLogoutWorks() throws Exception {
        mockMvc.perform(logout())
                .andExpect(status().isOk());
    }
}