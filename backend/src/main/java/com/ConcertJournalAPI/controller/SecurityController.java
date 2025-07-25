package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.security.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
public class SecurityController {

    @Value("${auth.cookie.secure}")
    private boolean secureCookie;

    @Value("${auth.cookie.httpOnly}")
    private boolean httpOnlyCookie;

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String refreshToken = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refreshToken")) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Claims claims = JwtUtils.parseToken(refreshToken);
            String subject = claims.getSubject();
            Authentication authentication = new UsernamePasswordAuthenticationToken(subject, null, Collections.emptyList());
            String newAccessToken = JwtUtils.generateToken(authentication);
            String newRefreshToken = JwtUtils.generateRefreshToken(authentication);

            // Set the new refresh token in a secure cookie
            Cookie newRefreshTokenCookie = new Cookie("refreshToken", newRefreshToken);
            newRefreshTokenCookie.setHttpOnly(false);
            newRefreshTokenCookie.setSecure(secureCookie); // Set to true if using HTTPS
            newRefreshTokenCookie.setMaxAge(86400 * 30); // 30 days
            newRefreshTokenCookie.setValue(newRefreshToken);
            newRefreshTokenCookie.setAttribute("SameSite", "Lax");

            return ResponseEntity.ok().body("{\"accessToken\":\"" + newAccessToken + "\"}");
        } catch (JwtException e) {
            // Handle invalid refresh token
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get-xsrf-cookie")
    public ResponseEntity<Void> getCsrfToken(CsrfToken token, HttpServletResponse response) {
        // Set the CSRF token as a cookie
        Cookie csrfCookie = new Cookie("XSRF-TOKEN", token.getToken());
        csrfCookie.setHttpOnly(false); // Required for JavaScript to access the cookie
        csrfCookie.setSecure(secureCookie); // Set to true if using HTTPS
        csrfCookie.setPath("/");
        csrfCookie.setAttribute("SameSite", "Lax");
        csrfCookie.setMaxAge(2592000); // 30 days in seconds, or omit for session cookie
        response.addCookie(csrfCookie);
        return ResponseEntity.ok().build();
    }
}