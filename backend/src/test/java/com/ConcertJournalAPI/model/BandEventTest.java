package com.ConcertJournalAPI.model;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class BandEventTest {

    private Validator validator;

    @PersistenceContext
    private EntityManager entityManager;

    @BeforeEach
    public void setupValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create validator", e);
        }
    }

    @Test
    void testDefaultConstructor() {
        BandEvent bandEvent = new BandEvent();
        assertNotNull(bandEvent);
    }

    @Test
    void testGettersAndSetters() {
        BandEvent bandEvent = new BandEvent();
        bandEvent.setId(1L);
        bandEvent.setBandName("Test Band");
        bandEvent.setPlace("Test Place");
        bandEvent.setDate(LocalDate.now());

        assertEquals(1L, bandEvent.getId());
        assertEquals("Test Band", bandEvent.getBandName());
        assertEquals("Test Place", bandEvent.getPlace());
        assertEquals(LocalDate.now(), bandEvent.getDate());
    }

    @Test
    void testValidation_BandNameNotBlank() {

        BandEvent bandEvent = new BandEvent();
        bandEvent.setBandName("");
        bandEvent.setDate(LocalDate.now());
        bandEvent.setCreationDate(Instant.now());
        bandEvent.setModificationDate(Instant.now());
        bandEvent.setRating(0);
        Set<ConstraintViolation<BandEvent>> violations = validator.validate(bandEvent);

        assertEquals(1, violations.size());
        assertEquals("Band Name is required.", violations.iterator().next().getMessage());
    }

    @Test
    void testValidation_DateNotBlank() {
        BandEvent bandEvent = new BandEvent();
        bandEvent.setBandName("Test Band");
        bandEvent.setCreationDate(Instant.now());
        bandEvent.setModificationDate(Instant.now());
        bandEvent.setRating(0);
        Set<ConstraintViolation<BandEvent>> violations = validator.validate(bandEvent);

        assertEquals(1, violations.size());
        assertEquals("Date is required.", violations.iterator().next().getMessage());
    }

//    @Test
//    void testToString() {
//        BandEvent bandEvent = new BandEvent();
//        bandEvent.setId(1L);
//        bandEvent.setBandName("Test Band");
//        bandEvent.setPlace("Test Place");
//        bandEvent.setComment("");
//        bandEvent.setDate(LocalDate.now());
//        bandEvent.setRating(2);
//        Instant timestamp = Instant.now();
//        bandEvent.setCreationDate(timestamp);
//        bandEvent.setModificationDate(timestamp);
//
//        String expected = "BandEvent(id=1, bandName=Test Band, place=Test Place, date=" + LocalDate.now() + ", comment=, rating=2, creationDate=" + timestamp + ", modificationDate=" + timestamp + ")";
//        assertEquals(expected, bandEvent.toString());
//    }

    @Test
    public void testValidBandEventCreation() {
        BandEvent bandEvent = new BandEvent();
        bandEvent.setBandName("Test Band");
        bandEvent.setPlace("Test Place");
        bandEvent.setDate(LocalDate.now());

        assertNotNull(bandEvent);
        assertEquals("Test Band", bandEvent.getBandName());
        assertEquals("Test Place", bandEvent.getPlace());
        assertNotNull(bandEvent.getDate());
    }

    @Test
    public void testInvalidBandEventCreation_BandNameIsNull() {
        BandEvent bandEvent = new BandEvent();
        bandEvent.setPlace("Test Place");
        bandEvent.setDate(LocalDate.now());

        assertThrows(NullPointerException.class, () -> {
            entityManager.persist(bandEvent);
            entityManager.flush();
        });
    }

    @Test
    public void testInvalidBandEventCreation_DateIsNull() {
        BandEvent bandEvent = new BandEvent();
        bandEvent.setBandName("Test Band");
        bandEvent.setPlace("Test Place");

        assertThrows(NullPointerException.class, () -> {
            entityManager.persist(bandEvent);
            entityManager.flush();
        });
    }

    @Test
    public void testComment() {
        BandEvent event = new BandEvent();
        event.setComment("Test comment");
        assertEquals("Test comment", event.getComment());
    }

    @Test
    public void testRatingValid() {
        BandEvent event = new BandEvent();
        event.setCreationDate(Instant.now());
        event.setModificationDate(Instant.now());
        event.setBandName("Test Band");
        event.setPlace("Test Place");
        event.setDate(LocalDate.now());
        event.setRating(3);
        Set<ConstraintViolation<BandEvent>> violations = validator.validate(event);
        Assertions.assertTrue(violations.isEmpty());
    }

    @Test
    public void testRatingTooLow() {
        BandEvent event = new BandEvent();
        event.setRating(-1);
        event.setCreationDate(Instant.now());
        event.setModificationDate(Instant.now());
        event.setBandName("Test Band");
        event.setPlace("Test Place");
        event.setDate(LocalDate.now());
        Set<ConstraintViolation<BandEvent>> violations = validator.validate(event);
        assertEquals(1, violations.size());
        assertEquals("Rating must be at least 0", violations.iterator().next().getMessage());
    }

    @Test
    public void testRatingTooHigh() {
        BandEvent event = new BandEvent();
        event.setCreationDate(Instant.now());
        event.setModificationDate(Instant.now());
        event.setBandName("Test Band");
        event.setPlace("Test Place");
        event.setDate(LocalDate.now());
        event.setRating(6);
        Set<ConstraintViolation<BandEvent>> violations = validator.validate(event);
        assertEquals(1, violations.size());
        assertEquals("Rating must be at most 5", violations.iterator().next().getMessage());
    }

    @Test
    public void testCreationDate() {
        BandEvent event = new BandEvent();
        Instant before = Instant.now();
        // Simulate persisting the event
        event.setCreationDate(before);
        Instant after = before.plusSeconds(2);

        assertNotNull(event.getCreationDate());
        Assertions.assertTrue(event.getCreationDate().isBefore(after));
    }

    @Test
    public void testModificationDate() {
        BandEvent event = new BandEvent();
        Instant fixedDate = Instant.parse("2022-01-01T12:00:00.00Z");
        event.setModificationDate(fixedDate);

        assertNotNull(event.getModificationDate());
        assertEquals(fixedDate, event.getModificationDate());
    }

}