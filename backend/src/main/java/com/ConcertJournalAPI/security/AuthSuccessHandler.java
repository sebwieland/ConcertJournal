package com.ConcertJournalAPI.security;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;

import java.io.IOException;

public class AuthSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthSuccessHandler.class);

    private final RefreshTokenService refreshTokenService;
    private final AppUserRepository appUserRepository;

    @Value("${auth.cookie.secure}")
    private boolean secureCookie;

    public AuthSuccessHandler(RefreshTokenService refreshTokenService, AppUserRepository appUserRepository) {
        this.refreshTokenService = refreshTokenService;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String email = authentication.getName();

        // Extract role from authorities (Spring prefixes with ROLE_)
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse("USER");

        // Generate access token
        String accessToken = JwtUtils.generateToken(email, role);

        // Create refresh token with server-side storage
        AppUser user = appUserRepository.findByEmail(email);
        String familyId = refreshTokenService.newFamilyId();
        String refreshToken = refreshTokenService.createRefreshToken(user, familyId);

        // Return only the access token in the response body
        response.setStatus(HttpStatus.OK.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"accessToken\":\"" + accessToken + "\"}");

        LOGGER.info("User {} authenticated successfully", email);

        // Store refresh token in HttpOnly cookie
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setSecure(secureCookie);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(86400 * 30); // 30 days
        cookie.setPath("/");
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }
}
