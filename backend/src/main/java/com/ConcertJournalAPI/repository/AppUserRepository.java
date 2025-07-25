package com.ConcertJournalAPI.repository;

import com.ConcertJournalAPI.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    AppUser findByEmail(String email);
    Boolean existsAppUserByEmail(String email);
}
