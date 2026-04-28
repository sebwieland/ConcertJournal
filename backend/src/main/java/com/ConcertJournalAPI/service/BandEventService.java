package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.exception.ResourceNotFoundException;
import com.ConcertJournalAPI.exception.UnauthorizedException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.BandEventRepository;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
        AppUser appUser = getAuthenticatedUser();
        return bandEventRepository.findAllByAppUser(appUser);
    }

    public BandEvent getEventById(Long id) {
        AppUser appUser = getAuthenticatedUser();
        return bandEventRepository.findByIdAndAppUser(id, appUser)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
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
        // Verify the event exists and belongs to the user (throws 404 if not)
        getEventById(id);
        AppUser appUser = getAuthenticatedUser();
        bandEventRepository.deleteByIdAndAppUser(id, appUser);
    }

    @Transactional
    public BandEvent saveEvent(BandEvent bandEvent) {
        AppUser appUser = getAuthenticatedUser();
        bandEvent.setAppUser(appUser);
        return bandEventRepository.save(bandEvent);
    }

    private AppUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedException("User is not authenticated");
        }
        String username = authentication.getName();
        AppUser appUser = appUserRepository.findByEmail(username);
        if (appUser == null) {
            throw new UnauthorizedException("User not found");
        }
        return appUser;
    }
}
