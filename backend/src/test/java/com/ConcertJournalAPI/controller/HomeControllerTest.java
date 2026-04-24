package com.ConcertJournalAPI.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class HomeControllerTest {

    @InjectMocks
    private HomeController homeController;

    @Mock
    private SecurityContext securityContext;

    @Test
    public void testCurrentUserAuthenticated() {
        // Arrange
        String expectedUsername = "testUser";
        Authentication authentication = new TestingAuthenticationToken(expectedUsername, null);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Act
        String result = homeController.currentUser();

        // Assert
        assertEquals(expectedUsername, result);
    }

    @Test
    public void testCurrentUserNotAuthenticated() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // Act
        String result = homeController.currentUser();

        // Assert
        assertEquals("anonymous", result);
    }

    @Test
    public void testCurrentUserAnonymous() {
        // Arrange
        String anonymousUsername = "anonymousUser";
        Authentication authentication = new TestingAuthenticationToken(anonymousUsername, null);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Act
        String result = homeController.currentUser();

        // Assert
        assertEquals("anonymous", result);
    }
}