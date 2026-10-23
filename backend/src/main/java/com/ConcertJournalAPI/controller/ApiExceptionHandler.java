package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.service.EventNotFoundException;
import com.ConcertJournalAPI.service.InvalidFieldException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Maps expected domain failures to proper status codes. Bodies follow the
 * {"status","error",...} shape the RateLimitFilter already uses; validation
 * failures add an {"errors": {field: message}} map, which the frontend's
 * apiErrors.ts reads on 422.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EventNotFoundException e) {
        return body(HttpStatus.NOT_FOUND, e.getMessage(), null);
    }

    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthenticated(AuthenticationCredentialsNotFoundException e) {
        return body(HttpStatus.UNAUTHORIZED, e.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidBody(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
            // First message per field is enough for a form hint
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return body(HttpStatus.UNPROCESSABLE_CONTENT, String.join(" ", errors.values()), errors);
    }

    @ExceptionHandler(InvalidFieldException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidField(InvalidFieldException e) {
        return body(HttpStatus.UNPROCESSABLE_CONTENT, e.getMessage(), Map.of(e.getField(), e.getMessage()));
    }

    private static ResponseEntity<Map<String, Object>> body(HttpStatus status, String message,
                                                            Map<String, String> errors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (errors != null) {
            body.put("errors", errors);
        }
        return ResponseEntity.status(status).body(body);
    }
}
