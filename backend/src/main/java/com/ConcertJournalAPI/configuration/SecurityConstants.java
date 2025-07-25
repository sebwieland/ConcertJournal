package com.ConcertJournalAPI.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConstants {
    public static String jwtSecret;
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    @Value("${JWT_SECRET}")
    public void setJwtSecret(String jwtSecret) {
        SecurityConstants.jwtSecret = jwtSecret;
    }
}