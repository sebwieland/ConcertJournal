package com.ConcertJournalAPI.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true)
    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email.")
    private String email;
    @NotBlank(message = "Password is required.")
    private String password;
    private String firstName;
    private String lastName;
    private String role;

    @JsonIgnore
    @OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BandEvent> bandEvents;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Instant creationDate;
    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Instant modificationDate;
}
