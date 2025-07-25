package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailsServiceTest {

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Mock
    private AppUserRepository appUserRepository;

    @Test
    public void testLoadUserByUsernameSuccess() {
        // Arrange
        String email = "test@example.com";
        AppUser appUser = new AppUser();
        appUser.setEmail(email);
        appUser.setPassword("password");
        appUser.setRole("USER");
        when(appUserRepository.findByEmail(email)).thenReturn(appUser);

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        // Assert
        assertEquals(email, userDetails.getUsername());
        assertEquals(appUser.getPassword(), userDetails.getPassword());
    }

    @Test
    public void testLoadUserByUsernameUserNotFound() {
        // Arrange
        String email = "testEmail@example.com";
        when(appUserRepository.findByEmail(email)).thenReturn(null);

        // Act and Assert
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername(email));
    }

    @Test
    public void testLoadUserByUsernameNullUsername() {
        // Act and Assert
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername(null));
    }
}