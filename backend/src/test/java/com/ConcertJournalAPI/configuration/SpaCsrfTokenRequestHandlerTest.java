package com.ConcertJournalAPI.configuration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.web.csrf.CsrfToken;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Tests for SpaCsrfTokenRequestHandler.
 *
 * When the CSRF header is present (SPA requests via JS), it resolves the raw token.
 * When the header is absent (form submissions), it delegates to XorCsrfTokenRequestAttributeHandler.
 */
@ExtendWith(MockitoExtension.class)
public class SpaCsrfTokenRequestHandlerTest {

    private SpaCsrfTokenRequestHandler handler;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private CsrfToken csrfToken;

    @BeforeEach
    void setUp() {
        handler = new SpaCsrfTokenRequestHandler();
    }

    @Test
    void resolveCsrfTokenValue_WithHeader_ReturnsRawToken() {
        when(csrfToken.getHeaderName()).thenReturn("X-XSRF-TOKEN");
        when(request.getHeader("X-XSRF-TOKEN")).thenReturn("raw-token-value");

        String result = handler.resolveCsrfTokenValue(request, csrfToken);

        assertEquals("raw-token-value", result);
    }

    @Test
    void resolveCsrfTokenValue_WithoutHeader_DelegatesToXorHandler() {
        when(csrfToken.getHeaderName()).thenReturn("X-XSRF-TOKEN");
        when(request.getHeader("X-XSRF-TOKEN")).thenReturn(null);

        // Without a header, the XOR handler is used. It will look for the token
        // parameter in the request, which we haven't set, so it returns null.
        String result = handler.resolveCsrfTokenValue(request, csrfToken);

        assertNull(result);
    }

    @Test
    void resolveCsrfTokenValue_WithEmptyHeader_DelegatesToXorHandler() {
        when(csrfToken.getHeaderName()).thenReturn("X-XSRF-TOKEN");
        when(csrfToken.getToken()).thenReturn("some-token");
        when(request.getHeader("X-XSRF-TOKEN")).thenReturn("");

        String result = handler.resolveCsrfTokenValue(request, csrfToken);

        assertNull(result);
    }
}
