package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.exception.UnauthorizedException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.security.JwtUtils;
import com.ConcertJournalAPI.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SecurityControllerTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private SecurityController securityController;

    @Test
    void testRefreshAccessToken_RefreshTokenNotFound_ReturnsBadRequest() {
        // Arrange
        when(request.getCookies()).thenReturn(null);

        // Act
        ResponseEntity<?> res = securityController.refreshAccessToken(request, response);

        // Assert
        assertEquals(400, res.getStatusCodeValue());
    }

    @Test
    void testRefreshAccessToken_RefreshTokenFoundButInvalid_ReturnsUnauthorized() {
        // Arrange
        Cookie[] cookies = new Cookie[]{new Cookie("refreshToken", "invalidToken")};
        when(request.getCookies()).thenReturn(cookies);
        when(refreshTokenService.validateAndRotate("invalidToken"))
                .thenThrow(new UnauthorizedException("Invalid refresh token"));

        // Act
        ResponseEntity<?> res = securityController.refreshAccessToken(request, response);

        // Assert
        assertEquals(401, res.getStatusCodeValue());
    }

    @Test
    void testRefreshAccessToken_RefreshTokenFoundAndValid_ReturnsOkWithNewAccessToken() {
        // Arrange
        String refreshTokenValue = "validRefreshToken";
        Cookie[] cookies = new Cookie[]{new Cookie("refreshToken", refreshTokenValue)};
        when(request.getCookies()).thenReturn(cookies);

        String newAccessToken = "newAccessToken";
        String newRefreshToken = "newRefreshToken";
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        RefreshTokenService.RotationResult rotationResult =
                new RefreshTokenService.RotationResult(newAccessToken, newRefreshToken, user);
        when(refreshTokenService.validateAndRotate(refreshTokenValue)).thenReturn(rotationResult);

        // Act
        ResponseEntity<?> res = securityController.refreshAccessToken(request, response);

        // Assert
        assertEquals(200, res.getStatusCodeValue());
        assertNotNull(res.getBody());
        assertTrue(res.getBody() instanceof String);
        String responseBody = (String) res.getBody();
        assertTrue(responseBody.contains(newAccessToken));
        verify(response).addCookie(any(Cookie.class));
    }
}
