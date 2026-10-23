package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.service.BandEventService;
import com.ConcertJournalAPI.service.EventNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ApiExceptionHandlerTest {

    @Mock
    private BandEventService bandEventService;

    @InjectMocks
    private BandEventController bandEventController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(bandEventController)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void missingEventIs404NotEmpty200() throws Exception {
        when(bandEventService.getEventById(42L)).thenThrow(new EventNotFoundException(42L));

        mockMvc.perform(get("/api/event/42"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void missingAuthenticationIs401NotGeneric500() throws Exception {
        when(bandEventService.getAllEvents())
                .thenThrow(new AuthenticationCredentialsNotFoundException("User is not authenticated"));

        mockMvc.perform(get("/api/allEvents"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
