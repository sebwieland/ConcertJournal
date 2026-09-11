package com.ConcertJournalAPI.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConstants {
    public static String jwtSecret;
    public static String cookieDomain = "";
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    @Value("${JWT_SECRET}")
    public void setJwtSecret(String jwtSecret) {
        SecurityConstants.jwtSecret = jwtSecret;
    }

    /** Cookie domain to set (e.g. "concertjournal.de"), empty string for none (localhost dev). */
    @Value("${auth.cookie.domain:}")
    public void setCookieDomain(String domain) {
        SecurityConstants.cookieDomain = domain;
    }
}