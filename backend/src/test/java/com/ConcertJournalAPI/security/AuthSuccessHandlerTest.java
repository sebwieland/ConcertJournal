package com.ConcertJournalAPI.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.PrintWriter;

import static org.junit.Assert.assertThrows;
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

    @BeforeEach
    public void setup() {
        authSuccessHandler = new AuthSuccessHandler();
        ReflectionTestUtils.setField(authSuccessHandler, "httpOnlyCookie", false);
        ReflectionTestUtils.setField(authSuccessHandler, "secureCookie", false);
    }

    @Test
    public void testOnAuthenticationSuccess_GenerateToken() throws IOException {
        // Arrange
        when(response.getWriter()).thenReturn(writer);

        // Act
        authSuccessHandler.onAuthenticationSuccess(request, response, authentication);

        // Assert
        String token = JwtUtils.generateToken(authentication);
        String refreshToken = JwtUtils.generateRefreshToken(authentication);
        verify(writer).write("{\"accessToken\":\"" + token + "\", " +
                "\"refreshToken\":\"" + refreshToken + "\"}");
    }

    @Test
    public void testOnAuthenticationSuccess_IOException() throws IOException {
        // Arrange
        when(response.getWriter()).thenThrow(new IOException());

        // Act and Assert
        assertThrows(IOException.class, () -> authSuccessHandler.onAuthenticationSuccess(request, response, authentication));
    }
}