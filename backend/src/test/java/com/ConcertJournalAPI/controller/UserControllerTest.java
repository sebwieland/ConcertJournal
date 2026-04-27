package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.dto.RegisterRequest;
import com.ConcertJournalAPI.exception.ConflictException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private UserService userService;

    @Test
    public void testRegisterUserSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        when(userService.registerUser(request)).thenReturn(new AppUser());

        var response = userController.registerUser(request);

        assertEquals(201, response.getStatusCode().value());
        assertEquals("User registered successfully", response.getBody());
        verify(userService, times(1)).registerUser(request);
    }

    @Test
    public void testRegisterUserEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        when(userService.registerUser(request)).thenThrow(new ConflictException("User already exists"));

        assertThrows(ConflictException.class, () -> userController.registerUser(request));
        verify(userService, times(1)).registerUser(request);
    }

    @Test
    public void testRegisterUserNullRequest() {
        // With UserService mock, null request just delegates to the service
        // and returns CREATED. Validation of null is handled by Spring MVC @Valid,
        // not by the controller itself.
        var response = userController.registerUser(null);
        assertEquals(201, response.getStatusCode().value());
    }
}
