package com.ConcertJournalAPI.configuration;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.web.csrf.CsrfToken;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CookieCsrfTokenRequestHandlerTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private CsrfToken csrfToken;

    @InjectMocks
    private CookieCsrfTokenRequestHandler handler;

    @Test
    public void testResolveCsrfTokenValue_CookieFound() {
        // Given
        Cookie cookie = new Cookie("XSRF-TOKEN", "token-value");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        // When
        String tokenValue = handler.resolveCsrfTokenValue(request, csrfToken);

        // Then
        assertEquals("token-value", tokenValue);
    }

    @Test
    public void testResolveCsrfTokenValue_CookieNotFound() {
        // Given
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("other-cookie", "value")});

        // When
        String tokenValue = handler.resolveCsrfTokenValue(request, csrfToken);

        // Then
        assertNull(tokenValue); // or you can check the value returned by super.resolveCsrfTokenValue()
    }

    @Test
    public void testResolveCsrfTokenValue_NoCookies() {
        // Given
        when(request.getCookies()).thenReturn(null);

        // When
        String tokenValue = handler.resolveCsrfTokenValue(request, csrfToken);

        // Then
        assertNull(tokenValue); // or you can check the value returned by super.resolveCsrfTokenValue()
    }

    @Test
    public void testResolveCsrfTokenValue_MultipleCookies() {
        // Given
        Cookie xsrfTokenCookie = new Cookie("XSRF-TOKEN", "token-value");
        Cookie otherCookie = new Cookie("other-cookie", "value");
        when(request.getCookies()).thenReturn(new Cookie[]{otherCookie, xsrfTokenCookie});

        // When
        String tokenValue = handler.resolveCsrfTokenValue(request, csrfToken);

        // Then
        assertEquals("token-value", tokenValue);
    }
}