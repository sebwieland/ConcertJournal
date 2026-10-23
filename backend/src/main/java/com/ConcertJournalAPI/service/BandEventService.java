package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.BandEventRepository;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BandEventService {
    @Autowired
    private BandEventRepository bandEventRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    public List<BandEvent> getAllEvents() {
        return bandEventRepository.findAllByAppUser(currentUser());
    }

    public BandEvent getEventById(Long id) {
        return bandEventRepository.findByIdAndAppUser(id, currentUser())
                .orElseThrow(() -> new EventNotFoundException(id));
    }

    @Transactional
    public BandEvent updateEvent(Long id, BandEvent updatedBandEvent) {
        BandEvent existingBandEvent = getEventById(id);
        existingBandEvent.setBandName(updatedBandEvent.getBandName());
        existingBandEvent.setDate(updatedBandEvent.getDate());
        existingBandEvent.setPlace(updatedBandEvent.getPlace());
        existingBandEvent.setRating(updatedBandEvent.getRating());
        existingBandEvent.setComment(updatedBandEvent.getComment());
        return bandEventRepository.save(existingBandEvent);
    }

    @Transactional
    public void deleteEventById(Long id) {
        bandEventRepository.deleteByIdAndAppUser(id, currentUser());
    }

    @Transactional
    public BandEvent saveEvent(BandEvent bandEvent) {
        bandEvent.setAppUser(currentUser());
        return bandEventRepository.save(bandEvent);
    }

    /** Every query is scoped to the authenticated owner — never trust an id alone. */
    private AppUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new AuthenticationCredentialsNotFoundException("User is not authenticated");
        }
        AppUser appUser = appUserRepository.findByEmail(authentication.getName());
        if (appUser == null) {
            // Token still valid for an account that has since been removed
            throw new AuthenticationCredentialsNotFoundException("User no longer exists");
        }
        return appUser;
    }

}
