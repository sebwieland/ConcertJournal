package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    public void testRegisterUserSuccess() {
        // Arrange
        AppUser user = new AppUser();
        user.setEmail("testUser");
        user.setPassword("password");
        when(appUserRepository.findByEmail(user.getEmail())).thenReturn(null);
        when(passwordEncoder.encode(user.getPassword())).thenReturn("encodedPassword");

        // Act
        String result = userController.registerUser(user).getBody();

        // Assert
        assertEquals("User registered successfully", result);
        verify(appUserRepository, times(1)).save(any(AppUser.class));
    }

    @Test
    public void testRegisterUserUsernameAlreadyExists() {
        // Arrange
        AppUser user = new AppUser();
        user.setEmail("testUser");
        user.setPassword("password");
        AppUser existingUser = new AppUser();
        existingUser.setEmail("testUser");
        existingUser.setPassword("existingPassword");
        when(appUserRepository.findByEmail(user.getEmail())).thenReturn(existingUser);

        // Act
        String result = userController.registerUser(user).getBody();

        // Assert
        assertEquals("User already exists", result);
        verify(appUserRepository, never()).save(any(AppUser.class));
    }

    @Test
    public void testRegisterUserNullUser() {
        // Act and Assert
        assertThrows(NullPointerException.class, () -> userController.registerUser(null));
    }
}