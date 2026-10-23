package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.service.EventNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Maps expected domain failures to proper status codes. Bodies follow the
 * {"status","error",...} shape the RateLimitFilter already uses.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EventNotFoundException e) {
        return body(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthenticated(AuthenticationCredentialsNotFoundException e) {
        return body(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    private static ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
