package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.service.BandEventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BandEventControllerTest {

    @Mock
    private BandEventService bandEventService;

    @Mock
    private AppUser appUser;

    @InjectMocks
    private BandEventController bandEventController;

    private BandEvent bandEvent1;
    private BandEvent bandEvent2;

    @BeforeEach
    void setup() {


        bandEvent1 = new BandEvent();
        bandEvent1.setBandName("TestBand1");
        bandEvent1.setPlace("TestPlace1");
        bandEvent1.setDate(LocalDate.now());
        bandEvent1.setAppUser(appUser);

        bandEvent2 = new BandEvent();
        bandEvent2.setBandName("TestBand1");
        bandEvent2.setPlace("TestPlace1");
        bandEvent2.setDate(LocalDate.now());
        bandEvent2.setAppUser(appUser);


    }

    @Test
    void testGetAllEvents() {
        List<BandEvent> events = Arrays.asList(bandEvent1, bandEvent2);
        when(bandEventService.getAllEvents()).thenReturn(events);

        List<BandEvent> response = bandEventController.getAllEvents();

        assertEquals(events, response);
        verify(bandEventService).getAllEvents();
    }

    @Test
    void testGetEventById() {
        when(bandEventService.getEventById(1L)).thenReturn(bandEvent1);

        BandEvent response = bandEventController.getEventById(1L);

        assertEquals(bandEvent1, response);
        verify(bandEventService).getEventById(1L);
    }

    @Test
    void testCreateEvent() {
        when(bandEventService.saveEvent(bandEvent1)).thenReturn(bandEvent1);

        BandEvent response = bandEventController.createEvent(bandEvent1);

        assertEquals(bandEvent1, response);
        verify(bandEventService).saveEvent(bandEvent1);
    }

    @Test
    void testDeleteEvent() {
        bandEventController.deleteEvent(1L);

        verify(bandEventService).deleteEventById(1L);
    }

    @Test
    void testUpdateEvent() {
        when(bandEventService.updateEvent(1L, bandEvent1)).thenReturn(bandEvent1);

        BandEvent response = bandEventController.updateEvent(1L, bandEvent1);

        assertEquals(bandEvent1, response);
        verify(bandEventService).updateEvent(1L, bandEvent1);
    }
}