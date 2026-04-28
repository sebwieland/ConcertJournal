package com.ConcertJournalAPI.repository;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BandEventRepository extends JpaRepository<BandEvent, Long> {
    List<BandEvent> findAllByAppUser(AppUser appUser);
    Optional<BandEvent> findByIdAndAppUser(Long id, AppUser appUser);
    void deleteByIdAndAppUser(Long id, AppUser appUser);

    @Query("SELECT COUNT(DISTINCT CONCAT(e.bandName, '-', e.date)) FROM BandEvent e")
    long countUniqueBandEvents();
}
