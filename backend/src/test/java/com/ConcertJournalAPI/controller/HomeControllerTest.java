package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.exception.ResourceNotFoundException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class HomeControllerTest {

    @InjectMocks
    private HomeController homeController;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private SecurityContext securityContext;

    @Test
    public void testCurrentUserAuthenticated() {
        // Arrange
        String expectedEmail = "testUser@example.com";
        Authentication authentication = new TestingAuthenticationToken(expectedEmail, null);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        AppUser expectedUser = new AppUser();
        expectedUser.setEmail(expectedEmail);
        when(appUserRepository.findByEmail(expectedEmail)).thenReturn(expectedUser);

        // Act
        AppUser result = homeController.currentUser();

        // Assert
        assertEquals(expectedUser, result);
        assertEquals(expectedEmail, result.getEmail());
    }

    @Test
    public void testCurrentUserNotAuthenticated() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> homeController.currentUser());
    }

    @Test
    public void testCurrentUserAnonymous() {
        // Arrange
        String anonymousUsername = "anonymousUser";
        Authentication authentication = new TestingAuthenticationToken(anonymousUsername, null);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> homeController.currentUser());
    }

    @Test
    public void testCurrentUserNotFoundInRepository() {
        // Arrange
        String email = "unknown@example.com";
        Authentication authentication = new TestingAuthenticationToken(email, null);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(appUserRepository.findByEmail(email)).thenReturn(null);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> homeController.currentUser());
    }
}
