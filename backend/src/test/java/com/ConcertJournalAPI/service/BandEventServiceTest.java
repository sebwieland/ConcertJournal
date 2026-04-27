package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.exception.ResourceNotFoundException;
import com.ConcertJournalAPI.exception.UnauthorizedException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.repository.BandEventRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BandEventServiceTest {

    @Mock
    private BandEventRepository bandEventRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @InjectMocks
    private BandEventService bandEventService;

    private AppUser appUser;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        appUser = new AppUser();
        appUser.setEmail("testUser");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setAuthentication(String username) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(appUserRepository.findByEmail(username)).thenReturn(appUser);
    }

    private BandEvent getSampleBandEvent() {
        BandEvent sampleEvent = new BandEvent();
        Long randomId = (long) (Math.random() * 1000);
        sampleEvent.setId(randomId);
        sampleEvent.setAppUser(appUser);
        return sampleEvent;
    }

    @Test
    void testGetAllEvents() {
        setAuthentication("testUser");
        List<BandEvent> sampleEvents = Arrays.asList(getSampleBandEvent(), getSampleBandEvent());
        when(bandEventRepository.findAllByAppUser(appUser)).thenReturn(sampleEvents);

        List<BandEvent> result = bandEventService.getAllEvents();

        assertNotNull(result);
        assertEquals(sampleEvents, result);
    }

    @Test
    void testGetEvent() {
        setAuthentication("testUser");
        BandEvent sampleEvent = getSampleBandEvent();
        when(bandEventRepository.findByIdAndAppUser(sampleEvent.getId(), appUser))
                .thenReturn(Optional.of(sampleEvent));

        BandEvent result = bandEventService.getEventById(sampleEvent.getId());

        assertNotNull(result);
        assertEquals(sampleEvent, result);
    }

    @Test
    void testGetEventNotFound() {
        setAuthentication("testUser");
        when(bandEventRepository.findByIdAndAppUser(999L, appUser))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bandEventService.getEventById(999L));
    }

    @Test
    void testSaveEvent() {
        setAuthentication("testUser");
        BandEvent sampleEvent = getSampleBandEvent();
        when(bandEventRepository.save(sampleEvent)).thenReturn(sampleEvent);

        BandEvent result = bandEventService.saveEvent(sampleEvent);

        assertNotNull(result);
        assertEquals(sampleEvent, result);
    }

    @Test
    void testDeleteEvent() {
        setAuthentication("testUser");
        BandEvent sampleEvent = getSampleBandEvent();

        bandEventService.deleteEventById(sampleEvent.getId());

        verify(bandEventRepository, times(1)).deleteByIdAndAppUser(sampleEvent.getId(), appUser);
    }

    @Test
    void testUpdateEvent() {
        setAuthentication("testUser");
        BandEvent sampleEvent = getSampleBandEvent();
        BandEvent updatedEvent = getSampleBandEvent();
        updatedEvent.setBandName("Updated Band");
        when(bandEventRepository.findByIdAndAppUser(sampleEvent.getId(), appUser))
                .thenReturn(Optional.of(sampleEvent));
        when(bandEventRepository.save(any(BandEvent.class))).thenReturn(sampleEvent);

        BandEvent result = bandEventService.updateEvent(sampleEvent.getId(), updatedEvent);

        assertNotNull(result);
        assertEquals(sampleEvent.getId(), result.getId());
        assertEquals(updatedEvent.getBandName(), result.getBandName());
    }

    @Test
    void testUpdateEventNotFound() {
        setAuthentication("testUser");
        BandEvent updatedEvent = getSampleBandEvent();
        when(bandEventRepository.findByIdAndAppUser(updatedEvent.getId(), appUser))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bandEventService.updateEvent(updatedEvent.getId(), updatedEvent));
    }

    // Unauthenticated access tests

    @Test
    void testGetAllEventsUnauthenticated() {
        assertThrows(UnauthorizedException.class, () -> bandEventService.getAllEvents());
    }

    @Test
    void testGetEventUnauthenticated() {
        assertThrows(UnauthorizedException.class, () -> bandEventService.getEventById(1L));
    }

    @Test
    void testSaveEventUnauthenticated() {
        assertThrows(UnauthorizedException.class, () -> bandEventService.saveEvent(getSampleBandEvent()));
    }

    @Test
    void testDeleteEventUnauthenticated() {
        assertThrows(UnauthorizedException.class, () -> bandEventService.deleteEventById(1L));
    }

    @Test
    void testUpdateEventUnauthenticated() {
        BandEvent updatedEvent = getSampleBandEvent();
        assertThrows(UnauthorizedException.class,
                () -> bandEventService.updateEvent(updatedEvent.getId(), updatedEvent));
    }
}
