package com.ConcertJournalAPI.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    public void setup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void testDoFilterInternal_NoToken() throws ServletException, IOException {
        try (MockedStatic<JwtUtils> jwtUtilsMock = Mockito.mockStatic(JwtUtils.class)) {
            jwtUtilsMock.when(() -> JwtUtils.extractTokenFromRequest(request)).thenReturn(null);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
        }
    }

    @Test
    public void testDoFilterInternal_ValidToken() throws ServletException, IOException {
        String token = "valid-test-token";
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("testUser");
        when(claims.get("type", String.class)).thenReturn(JwtUtils.TOKEN_TYPE_ACCESS);
        when(claims.get("role", String.class)).thenReturn("USER");

        try (MockedStatic<JwtUtils> jwtUtilsMock = Mockito.mockStatic(JwtUtils.class)) {
            jwtUtilsMock.when(() -> JwtUtils.extractTokenFromRequest(request)).thenReturn(token);
            jwtUtilsMock.when(() -> JwtUtils.parseToken(token)).thenReturn(claims);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        }
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void testDoFilterInternal_InvalidToken() throws ServletException, IOException {
        try (MockedStatic<JwtUtils> jwtUtilsMock = Mockito.mockStatic(JwtUtils.class)) {
            jwtUtilsMock.when(() -> JwtUtils.extractTokenFromRequest(request)).thenReturn(null);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
        }
    }

    @Test
    public void testAuthenticateUser() {
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("username");
        when(claims.get("role", String.class)).thenReturn("USER");

        jwtAuthenticationFilter.authenticateUser(claims);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals("username", authentication.getName());
    }
}
