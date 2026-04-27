package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.service.BandEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api")
public class BandEventController {

    private final BandEventService bandEventService;

    public BandEventController(BandEventService bandEventService) {
        this.bandEventService = bandEventService;
    }

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
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        bandEventService.deleteEventById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/event/{id}")
    public BandEvent updateEvent(@PathVariable Long id, @RequestBody @Valid BandEvent bandEvent) {
        return bandEventService.updateEvent(id, bandEvent);
    }
}
