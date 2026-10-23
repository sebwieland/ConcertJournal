package com.ConcertJournalAPI.service;

/** A single request field failed a server-side check (e.g. wrong current password) → 422 with field error. */
public class InvalidFieldException extends RuntimeException {
    private final String field;

    public InvalidFieldException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
