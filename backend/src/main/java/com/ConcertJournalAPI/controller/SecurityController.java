package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.configuration.SecurityConstants;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.security.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api")
public class SecurityController {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SecurityController.class);

    @Value("${auth.cookie.secure}")
    private boolean secureCookie;

    @Autowired
    private AppUserRepository appUserRepository;

    @Value("${server.servlet.session.cookie.same-site:None}")
    private String sameSiteCookie;

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
            if (!JwtUtils.TOKEN_TYPE_REFRESH.equals(claims.get(JwtUtils.CLAIM_TOKEN_TYPE, String.class))) {
                return ResponseEntity.badRequest().build();
            }
            String subject = claims.getSubject();
            // Deleted accounts keep a valid-looking refresh cookie on other devices
            if (!Boolean.TRUE.equals(appUserRepository.existsAppUserByEmail(subject))) {
                return ResponseEntity.badRequest().build();
            }
            // No refresh-token rotation by design: sessions end 30 days after
            // login regardless of activity (accepted, see arc42 §11 R2)
            Authentication authentication = new UsernamePasswordAuthenticationToken(subject, null, Collections.emptyList());
            String newAccessToken = JwtUtils.generateToken(authentication);

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

        // SameSite=None requires Secure across all browsers
        boolean effectiveSecure = secureCookie;
        if ("None".equals(sameSiteCookie) && !effectiveSecure) {
            effectiveSecure = true;
            log.warn("Forcing secure=true for XSRF-TOKEN cookie because SameSite=None requires it. Original setting was secure=false.");
        }
        
        csrfCookie.setSecure(effectiveSecure);
        csrfCookie.setPath("/");
        csrfCookie.setAttribute("SameSite", sameSiteCookie);
        if (org.springframework.util.StringUtils.hasText(SecurityConstants.cookieDomain)) {
            csrfCookie.setDomain(SecurityConstants.cookieDomain);
        }
        csrfCookie.setMaxAge(2592000); // 30 days in seconds
        
        log.info("Setting XSRF-TOKEN cookie - secure: {}, sameSite: {}", effectiveSecure, sameSiteCookie);
        
        response.addCookie(csrfCookie);
        return ResponseEntity.ok().build();
    }
}