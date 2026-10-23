package com.ConcertJournalAPI.service;

/** Event does not exist or belongs to another user — both surface as 404 so ids can't be probed. */
public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(Long id) {
        super("Event " + id + " not found");
    }
}
