package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserController.RegisterRequest request(String email, String password) {
        return new UserController.RegisterRequest(email, password, "First", "Last");
    }

    @Test
    public void testRegisterUserSuccess() {
        // Arrange
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(null);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");

        // Act
        ResponseEntity<String> response = userController.registerUser(request("test@example.com", "password"));

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("User registered successfully", response.getBody());
        ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
        verify(appUserRepository, times(1)).save(captor.capture());
        assertEquals("encodedPassword", captor.getValue().getPassword());
        assertEquals("USER", captor.getValue().getRole());
    }

    @Test
    public void testRegisterUserEmailAlreadyExists() {
        // Arrange
        AppUser existingUser = new AppUser();
        existingUser.setEmail("test@example.com");
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(existingUser);

        // Act
        ResponseEntity<String> response = userController.registerUser(request("test@example.com", "password"));

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("User already exists", response.getBody());
        verify(appUserRepository, never()).save(any(AppUser.class));
    }
}
