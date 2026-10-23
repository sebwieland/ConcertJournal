package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.repository.BandEventRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/** Self-service for the signed-in user: data export (GDPR Art. 20), password change, account deletion (Art. 17). */
@Service
public class AccountService {
    private final CurrentUserProvider currentUser;
    private final AppUserRepository appUserRepository;
    private final BandEventRepository bandEventRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(CurrentUserProvider currentUser, AppUserRepository appUserRepository,
                          BandEventRepository bandEventRepository, PasswordEncoder passwordEncoder) {
        this.currentUser = currentUser;
        this.appUserRepository = appUserRepository;
        this.bandEventRepository = bandEventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Everything stored about the user except the password hash and internal role. */
    public record AccountExport(String email, String firstName, String lastName,
                                Instant memberSince, Instant exportedAt, List<BandEvent> events) {
    }

    public AccountExport export() {
        AppUser user = currentUser.get();
        return new AccountExport(user.getEmail(), user.getFirstName(), user.getLastName(),
                user.getCreationDate(), Instant.now(), bandEventRepository.findAllByAppUser(user));
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        AppUser user = currentUser.get();
        verifyPassword(user, currentPassword, "currentPassword");
        user.setPassword(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String password) {
        AppUser user = currentUser.get();
        verifyPassword(user, password, "password");
        // Explicit rather than relying on the lazy cascade collection being loaded
        bandEventRepository.deleteAll(bandEventRepository.findAllByAppUser(user));
        appUserRepository.delete(user);
    }

    private void verifyPassword(AppUser user, String rawPassword, String field) {
        if (rawPassword == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidFieldException(field, "Password is incorrect.");
        }
    }
}
