package com.ConcertJournalAPI.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import javax.crypto.SecretKey;
import java.util.Date;

import static com.ConcertJournalAPI.configuration.SecurityConstants.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtUtilsTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private Authentication authentication;

    @Test
    void testGetSigningKey() {
        SecretKey signingKey = JwtUtils.getSigningKey();
        assertNotNull(signingKey);
    }

    @Test
    void testExtractTokenFromRequest() {
        when(request.getHeader(AUTHORIZATION_HEADER)).thenReturn("Bearer test-token");
        String token = JwtUtils.extractTokenFromRequest(request);
        assertEquals("test-token", token);
    }

    @Test
    void testExtractTokenFromRequestNoHeader() {
        when(request.getHeader(AUTHORIZATION_HEADER)).thenReturn(null);
        String token = JwtUtils.extractTokenFromRequest(request);
        assertNull(token);
    }

    @Test
    void testExtractTokenFromRequestInvalidHeader() {
        when(request.getHeader(AUTHORIZATION_HEADER)).thenReturn("Invalid token");
        String token = JwtUtils.extractTokenFromRequest(request);
        assertNull(token);
    }

    @Test
    void testParseTokenValidToken() throws JwtException {
        String token = generateToken("test-subject", 10000);
        Claims claims = JwtUtils.parseToken(token);
        assertNotNull(claims);
        assertEquals("test-subject", claims.getSubject());
    }

    @Test
    void testParseTokenExpiredToken() {
        String token = generateToken("test-subject", -1);
        assertThrows(JwtException.class, () -> JwtUtils.parseToken(token));
    }

    @Test
    void testParseTokenInvalid() {
        String token = "Invalid token";
        assertThrows(JwtException.class, () -> JwtUtils.parseToken(token));
    }

    @Test
    public void testParseTokenNullClaims() {
        String token = Jwts.builder()
                .signWith(JwtUtils.getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
        assertThrows(JwtException.class, () -> JwtUtils.parseToken(token));
    }

    private String generateToken(String subject, long expirationTime) {
        Date expirationDate = new Date(System.currentTimeMillis() + expirationTime);
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(expirationDate)
                .signWith(JwtUtils.getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void testGenerateToken() {
        when(authentication.getName()).thenReturn("testUser");
        String token = JwtUtils.generateToken(authentication);
        assertNotNull(token);
        assertNotEquals("", token);
    }

    @Test
    void testGeneratedTokenCanBeParsed() throws JwtException {
        when(authentication.getName()).thenReturn("testUser");

        String token = JwtUtils.generateToken(authentication);
        Claims claims = JwtUtils.parseToken(token);

        assertNotNull(claims);
        assertEquals("testUser", claims.getSubject());
        assertTrue(claims.getIssuedAt().before(new Date()));
        assertTrue(claims.getExpiration().after(new Date()));
    }


    @Test
    void testGeneratedTokenHasCorrectExpiration() throws JwtException {
        when(authentication.getName()).thenReturn("testUser");
        long now = new Date().getTime();

        String token = JwtUtils.generateToken(authentication);
        Claims claims = JwtUtils.parseToken(token);

        long expiration = claims.getExpiration().getTime();
        assertTrue(expiration > now);
        assertTrue(expiration < now + 86400000); // 1 day
    }


}