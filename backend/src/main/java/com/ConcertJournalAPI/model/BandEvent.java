package com.ConcertJournalAPI.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Table(name = "band_events")
@Entity
public class BandEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Band Name is required.")
    private String bandName;
    private String place;
    @NotNull(message = "Date is required.")
    private LocalDate date;
    private String comment = "";
    @Min(value = 0, message = "Rating must be at least 0")
    @Max(value = 5, message = "Rating must be at most 5")
    @NotNull(message = "Rating is required.")
    private Integer rating;
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Instant creationDate;
    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Instant modificationDate;

    @ManyToOne
    @JoinColumn(name = "users_id")
    private AppUser appUser;

}
