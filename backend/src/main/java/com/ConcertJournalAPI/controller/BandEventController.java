package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.service.BandEventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:3000")
@Validated
@RestController
public class BandEventController {
    @Autowired
    private BandEventService bandEventService;

    @Autowired
    private AppUserRepository appUserRepository;

    @GetMapping("/allEvents")
    public List<BandEvent> getAllEvents() {
        return bandEventService.getAllEvents();
    }

    @GetMapping("/event/{id}")
    public BandEvent getEventById(@PathVariable Long id) {
        return bandEventService.getEventById(id);
    }

    @PostMapping("/event")
    public BandEvent createEvent(@RequestBody @Valid BandEvent bandEvent) {
        return bandEventService.saveEvent(bandEvent);
    }

    @DeleteMapping("/event/{id}")
    public void deleteEvent(@PathVariable Long id) {
        bandEventService.deleteEventById(id);
    }

    @PutMapping("/event/{id}")
    public BandEvent updateEvent(@PathVariable Long id, @RequestBody @Valid BandEvent bandEvent) {
        return bandEventService.updateEvent(id, bandEvent);
    }
}
