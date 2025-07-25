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
import java.io.PrintWriter;

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

    @Mock
    private Authentication authentication;

    @Mock
    private PrintWriter writer;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    public void setup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void testDoFilterInternal_NoToken() throws ServletException, IOException {
        when(JwtUtils.extractTokenFromRequest(request)).thenReturn(null);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);

    }

    @Test
    public void testDoFilterInternal_ValidToken() throws ServletException, IOException {
        String token = JwtUtils.generateToken(authentication);
        try (MockedStatic<JwtUtils> jwtUtilsMock = Mockito.mockStatic(JwtUtils.class)) {
            jwtUtilsMock.when(() -> JwtUtils.extractTokenFromRequest(request)).thenReturn(token);
            jwtUtilsMock.when(()-> JwtUtils.parseToken(token)).thenReturn(mock(Claims.class));

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        }
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void testDoFilterInternal_InvalidToken() throws ServletException, IOException {
        try (MockedStatic<JwtUtils> jwtUtilsMock = Mockito.mockStatic(JwtUtils.class)) {
            jwtUtilsMock.when(() -> JwtUtils.parseToken("invalidToken")).thenReturn(null);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
        }
    }

    @Test
    public void testAuthenticateUser() {
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("username");

        jwtAuthenticationFilter.authenticateUser(claims);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals("username", authentication.getName());
    }

    @Test
    public void testHandleInvalidToken() throws IOException {
        when(response.getWriter()).thenReturn(writer);

        jwtAuthenticationFilter.handleInvalidToken(response);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");
        verify(response.getWriter()).write("{\"error\":\"Invalid token\"}");
    }
}