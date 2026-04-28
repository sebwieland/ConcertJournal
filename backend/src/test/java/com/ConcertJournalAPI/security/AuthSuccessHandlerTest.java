package com.ConcertJournalAPI.security;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthSuccessHandlerTest {

    private AuthSuccessHandler authSuccessHandler;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private Authentication authentication;

    @Mock
    private PrintWriter writer;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AppUserRepository appUserRepository;

    @BeforeEach
    public void setup() {
        authSuccessHandler = new AuthSuccessHandler(refreshTokenService, appUserRepository);
        ReflectionTestUtils.setField(authSuccessHandler, "secureCookie", false);
    }

    @Test
    public void testOnAuthenticationSuccess_GenerateToken() throws IOException {
        // Arrange
        String email = "test@example.com";
        when(authentication.getName()).thenReturn(email);
        doReturn((Collection) List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .when(authentication).getAuthorities();
        when(response.getWriter()).thenReturn(writer);

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setRole("USER");
        when(appUserRepository.findByEmail(email)).thenReturn(user);

        String familyId = "test-family-id";
        when(refreshTokenService.newFamilyId()).thenReturn(familyId);
        when(refreshTokenService.createRefreshToken(user, familyId)).thenReturn("mock-refresh-token");

        // Act
        authSuccessHandler.onAuthenticationSuccess(request, response, authentication);

        // Assert
        verify(response).setStatus(200);
        verify(response).setContentType("application/json");
        verify(writer).write(argThat((String s) -> s.contains("accessToken")));
        verify(refreshTokenService).createRefreshToken(user, familyId);
        verify(response).addCookie(any());
    }

    @Test
    public void testOnAuthenticationSuccess_IOException() throws IOException {
        // Arrange
        String email = "test@example.com";
        when(authentication.getName()).thenReturn(email);
        doReturn((Collection) List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .when(authentication).getAuthorities();

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setRole("USER");
        when(appUserRepository.findByEmail(email)).thenReturn(user);

        String familyId = "test-family-id";
        when(refreshTokenService.newFamilyId()).thenReturn(familyId);
        when(refreshTokenService.createRefreshToken(user, familyId)).thenReturn("mock-refresh-token");

        when(response.getWriter()).thenThrow(new IOException());

        // Act and Assert
        assertThrows(IOException.class, () -> authSuccessHandler.onAuthenticationSuccess(request, response, authentication));
    }
}
