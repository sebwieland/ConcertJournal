package com.ConcertJournalAPI.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.AuthenticationException;
import com.ConcertJournalAPI.security.AuthFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthFailureHandlerTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private AuthenticationException exception;

    @Mock
    private PrintWriter writer;

    @InjectMocks
    private AuthFailureHandler authFailureHandler;

    @Test
    void testOnAuthenticationFailure() throws IOException {
        // Arrange
        when(response.getWriter()).thenReturn(writer);
        when(exception.getMessage()).thenReturn("Test error message");

        // Act
        authFailureHandler.onAuthenticationFailure(request, response, exception);

        // Assert
        verify(response).setStatus(401);
        verify(response).setContentType("application/json");
        verify(response.getWriter()).write("{\"error\":\"Test error message\"}");
    }

    @Test
    void testOnAuthenticationFailure_IOException() throws IOException {
        // Arrange
        when(response.getWriter()).thenThrow(new IOException());

        // Act and Assert
        assertThrows(IOException.class, () -> authFailureHandler.onAuthenticationFailure(request, response, exception));
    }
}
