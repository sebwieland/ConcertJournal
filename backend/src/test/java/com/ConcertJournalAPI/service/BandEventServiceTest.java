package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.BandEventRepository;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
@EnableAutoConfiguration
class BandEventServiceTest {

    @Mock
    private BandEventRepository bandEventRepository;

    private BandEventService bandEventService;

    @Mock
    private AppUserRepository appUserRepository;

    private AppUser appUser;

    public BandEvent getSampleBandEvent() {
        BandEvent sampleEvent = new BandEvent();
        Long randomId = (long) (Math.random() * 1000);
        sampleEvent.setId(randomId);
        sampleEvent.setAppUser(new AppUser());
        return sampleEvent;
    }

    public AppUser getSampleAppUser() {
        AppUser sampleUser = new AppUser();
        sampleUser.setEmail("testUser");
        return sampleUser;
    }

    @BeforeEach
    void setup() {
        // Real provider over the mocked repository: auth edge cases stay under test
        bandEventService = new BandEventService(bandEventRepository, new CurrentUserProvider(appUserRepository));
        appUser = getSampleAppUser();
        // lenient: the unauthenticated tests never reach the user lookup
        lenient().when(appUserRepository.findByEmail("testUser")).thenReturn(appUser);
    }


    @Test
    @WithMockUser(username = "testUser")
    void testGetAllEvents() {
        List<BandEvent> sampleEvents = Arrays.asList(getSampleBandEvent(), getSampleBandEvent());
        when(bandEventRepository.findAllByAppUser(appUser)).thenReturn(sampleEvents);

        // When: calling the service method
        List<BandEvent> result = bandEventService.getAllEvents();

        // Then: verify the result
        assertNotNull(result);
        assertEquals(sampleEvents, result);
    }

    @Test
    @WithMockUser(username = "testUser")
    void testGetEvent() {
        //Given: a mock repository with one sample BandEvent
        BandEvent sampleEvent = getSampleBandEvent();
        when(bandEventRepository.findByIdAndAppUser(sampleEvent.getId(), appUser)).thenReturn(java.util.Optional.of(sampleEvent));

        // When: calling the service method
        BandEvent result = bandEventService.getEventById(sampleEvent.getId());

        // Then: verify the result
        assertNotNull(result);
        assertEquals(sampleEvent, result);
    }

    @Test
    @WithMockUser(username = "testUser")
    void testSaveEvent() {
        // Given: a mock repository with one sample BandEvent
        BandEvent sampleEvent = getSampleBandEvent();
        when(bandEventRepository.save(sampleEvent)).thenReturn(sampleEvent);

        // When: calling the service method
        BandEvent result = bandEventService.saveEvent(sampleEvent);

        //Then: verify the result
        assertNotNull(result);
        assertEquals(sampleEvent, result);
    }

    @Test
    @WithMockUser(username = "testUser")
    void testDeleteEvent() {
        // Given: a mock repository with one sample BandEvent
        BandEvent sampleEvent = getSampleBandEvent();

        // When: calling the service method
        bandEventService.deleteEventById(sampleEvent.getId());

        // Then: verify the result
        verify(bandEventRepository, times(1)).deleteByIdAndAppUser(sampleEvent.getId(), appUser);
    }

    @Test
    void testGetAllEventsInvalidAuthentification() {
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> bandEventService.getAllEvents());
    }

    @Test
    void testGetEventInvalidAuthentification() {
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> bandEventService.getEventById(1L));
    }

    @Test
    void testSaveEventInvalidAuthentification() {
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> bandEventService.saveEvent(getSampleBandEvent()));
    }

    @Test
    void testDeleteEventInvalidAuthentification() {
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> bandEventService.deleteEventById(1L));
    }

    @Test
    @WithMockUser(username = "testUser")
    void testUpdateEvent() {
        // Given: a mock repository with one sample BandEvent
        BandEvent sampleEvent = getSampleBandEvent();
        BandEvent updatedEvent = getSampleBandEvent();
        updatedEvent.setBandName("Updated Band");
        when(bandEventRepository.findByIdAndAppUser(sampleEvent.getId(), appUser)).thenReturn(java.util.Optional.of(sampleEvent));
        when(bandEventRepository.save(any(BandEvent.class))).thenReturn(sampleEvent);

        // When: calling the service method
        BandEvent result = bandEventService.updateEvent(sampleEvent.getId(), updatedEvent);

        // Then: verify the result
        assertNotNull(result);
        assertEquals(sampleEvent.getId(), result.getId());
        assertEquals(updatedEvent.getBandName(), result.getBandName());
    }

    @Test
    @WithMockUser(username = "testUser")
    void testUpdateEventNotFound() {
        // Given: a mock repository with no BandEvent
        BandEvent updatedEvent = getSampleBandEvent();
        when(bandEventRepository.findByIdAndAppUser(updatedEvent.getId(), appUser)).thenReturn(java.util.Optional.empty());

        // When: calling the service method
        assertThrows(EventNotFoundException.class, () -> bandEventService.updateEvent(updatedEvent.getId(), updatedEvent));
    }

    @Test
    void testUpdateEventInvalidAuthentification() {
        // Given: no authentication
        BandEvent updatedEvent = getSampleBandEvent();

        // When: calling the service method
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> bandEventService.updateEvent(updatedEvent.getId(), updatedEvent));
    }

    @Test
    @WithMockUser(username = "testUser")
    void testGetEventNotFound() {
        when(bandEventRepository.findByIdAndAppUser(42L, appUser)).thenReturn(java.util.Optional.empty());

        assertThrows(EventNotFoundException.class, () -> bandEventService.getEventById(42L));
    }

    @Test
    @WithMockUser(username = "deletedUser")
    void testAuthenticatedButUnknownUser() {
        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> bandEventService.getAllEvents());
        verify(bandEventRepository, never()).findAllByAppUser(any());
    }

}
