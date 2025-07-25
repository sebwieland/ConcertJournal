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
@Import({PasswordConfig.class, SecurityConfiguration.class, CorsConfig.class})
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
        mockMvc.perform(get("/allEvents"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithAnonymousUser
    public void testUnauthorizedAccessToEventsEndpoint() throws Exception {
        mockMvc.perform(get("/allEvents"))
                .andExpect(status().isFound())
                .andExpect(redirectedUrlPattern("**/login"));
    }

    @Test
    public void testCsrfProtection() throws Exception {
        mockMvc.perform(post("/allEvents")
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

    @Test
    void testCsrfRequestMatcher() {
        // Arrange
        SecurityConfiguration securityConfiguration = new SecurityConfiguration();
        RequestMatcher csrfRequestMatcher = securityConfiguration.csrfRequestMatcher();

        // Act and Assert
        HttpServletRequest getRequest = mock(HttpServletRequest.class);
        when(getRequest.getMethod()).thenReturn(HttpMethod.GET.name());
        Assertions.assertFalse(csrfRequestMatcher.matches(getRequest));

        HttpServletRequest postRequest = mock(HttpServletRequest.class);
        when(postRequest.getMethod()).thenReturn(HttpMethod.POST.name());
        Assertions.assertTrue(csrfRequestMatcher.matches(postRequest));

        HttpServletRequest headRequest = mock(HttpServletRequest.class);
        when(headRequest.getMethod()).thenReturn(HttpMethod.HEAD.name());
        Assertions.assertFalse(csrfRequestMatcher.matches(headRequest));

        HttpServletRequest optionsRequest = mock(HttpServletRequest.class);
        when(optionsRequest.getMethod()).thenReturn(HttpMethod.OPTIONS.name());
        Assertions.assertFalse(csrfRequestMatcher.matches(optionsRequest));

        HttpServletRequest traceRequest = mock(HttpServletRequest.class);
        when(traceRequest.getMethod()).thenReturn(HttpMethod.TRACE.name());
        Assertions.assertFalse(csrfRequestMatcher.matches(traceRequest));
    }
}