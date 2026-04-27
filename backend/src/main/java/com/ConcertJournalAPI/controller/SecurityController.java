package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.exception.UnauthorizedException;
import com.ConcertJournalAPI.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SecurityController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SecurityController.class);

    private final RefreshTokenService refreshTokenService;

    @Value("${auth.cookie.secure}")
    private boolean secureCookie;

    @Value("${auth.cookie.same-site:Lax}")
    private String sameSiteCookie;

    @Value("${auth.cookie.domain:}")
    private String cookieDomain;

    public SecurityController(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        // Extract refresh token from cookie
        Cookie[] cookies = request.getCookies();
        String refreshToken = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Validate, rotate, and get new tokens (includes user existence check and role loading)
            RefreshTokenService.RotationResult result = refreshTokenService.validateAndRotate(refreshToken);

            // Set the new refresh token in HttpOnly cookie
            Cookie newRefreshTokenCookie = new Cookie("refreshToken", result.refreshToken());
            newRefreshTokenCookie.setHttpOnly(true);
            newRefreshTokenCookie.setSecure(secureCookie);
            newRefreshTokenCookie.setMaxAge(86400 * 30); // 30 days
            newRefreshTokenCookie.setAttribute("SameSite", "Lax");
            if (cookieDomain != null && !cookieDomain.isEmpty()) {
                newRefreshTokenCookie.setDomain(cookieDomain);
            }
            newRefreshTokenCookie.setPath("/");
            response.addCookie(newRefreshTokenCookie);

            return ResponseEntity.ok().body("{\"accessToken\":\"" + result.accessToken() + "\"}");
        } catch (UnauthorizedException e) {
            log.debug("Refresh token rejected: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            log.error("Error during token refresh", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get-xsrf-cookie")
    public ResponseEntity<Void> getCsrfToken(CsrfToken token, HttpServletResponse response) {
        Cookie csrfCookie = new Cookie("XSRF-TOKEN", token.getToken());
        csrfCookie.setHttpOnly(false);

        boolean effectiveSecure = secureCookie;
        if ("None".equals(sameSiteCookie)) {
            effectiveSecure = true;
        }

        csrfCookie.setSecure(effectiveSecure);
        csrfCookie.setPath("/");
        csrfCookie.setAttribute("SameSite", sameSiteCookie);
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            csrfCookie.setDomain(cookieDomain);
        }
        csrfCookie.setMaxAge(2592000);

        response.addCookie(csrfCookie);
        return ResponseEntity.ok().build();
    }
}
