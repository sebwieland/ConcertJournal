package com.ConcertJournalAPI.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.SecretKey;

import java.util.Date;
import java.util.Optional;

import static com.ConcertJournalAPI.configuration.SecurityConstants.*;

public class JwtUtils {
    private static final String jwtSecret;

    static {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable must be set");
        }
        if (secret.getBytes().length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 characters (256 bits) for HMAC-SHA256. Current length: " + secret.length());
        }
        jwtSecret = secret;
    }

    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    public static String generateToken(String subject, String role) {
        return Jwts.builder()
                .subject(subject)
                .claim("type", TOKEN_TYPE_ACCESS)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + 180000)) // 3 Minutes
                .signWith(getSigningKey())
                .compact();
    }

    public static String generateRefreshToken(String subject, String role) {
        return Jwts.builder()
                .subject(subject)
                .claim("type", TOKEN_TYPE_REFRESH)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + 2592000000L)) // 30 days
                .signWith(getSigningKey())
                .compact();
    }

    static SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public static String extractTokenFromRequest(HttpServletRequest request) {
        String token = request.getHeader(AUTHORIZATION_HEADER);
        if (token != null && token.startsWith(BEARER_PREFIX)) {
            return token.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    public static Claims parseToken(String token) throws JwtException {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (IllegalArgumentException e) {
            throw new JwtException("Invalid token", e);
        }
    }
}
