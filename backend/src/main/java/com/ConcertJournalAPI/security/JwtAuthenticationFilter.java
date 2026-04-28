package com.ConcertJournalAPI.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String token = JwtUtils.extractTokenFromRequest(request);
        if (token != null) {
            try {
                Claims claims = JwtUtils.parseToken(token);
                // Only accept access tokens, not refresh tokens
                String tokenType = claims.get("type", String.class);
                if (JwtUtils.TOKEN_TYPE_ACCESS.equals(tokenType)) {
                    authenticateUser(claims);
                }
            } catch (JwtException e) {
                logger.debug("Invalid JWT token");
            }
        }
        filterChain.doFilter(request, response);
    }

    void authenticateUser(Claims claims) {
        String username = claims.getSubject();
        String role = claims.get("role", String.class);
        List<GrantedAuthority> authorities = (role != null)
                ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                : Collections.emptyList();
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}

