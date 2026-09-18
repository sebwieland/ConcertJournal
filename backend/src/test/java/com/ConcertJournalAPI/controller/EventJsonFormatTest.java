package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.service.BandEventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.ConcertJournalAPI.configuration.SecurityConfiguration;
import com.ConcertJournalAPI.configuration.PasswordConfig;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.AppUserRepository;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BandEventController.class)
@AutoConfigureMockMvc
@Import({PasswordConfig.class, SecurityConfiguration.class})
public class EventJsonFormatTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BandEventService bandEventService;

    @MockBean
    private AppUserRepository appUserRepository;

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    public void testDatesAreSerializedAsIsoStrings() throws Exception {
        // Regression: Jackson defaulted to numeric/array serialization
        // ([2026,9,14], epoch decimals), forcing the SPA to carry a defensive
        // array-date parser. ISO strings are the API contract.
        BandEvent event = new BandEvent();
        event.setId(1L);
        event.setBandName("TestBand");
        event.setDate(LocalDate.of(2026, 9, 14));

        when(bandEventService.getAllEvents()).thenReturn(List.of(event));

        mockMvc.perform(get("/api/allEvents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].date").value("2026-09-14"))
                .andExpect(jsonPath("$[0].date").isString())
                .andExpect(jsonPath("$[0].bandName").value("TestBand"));
    }
}
