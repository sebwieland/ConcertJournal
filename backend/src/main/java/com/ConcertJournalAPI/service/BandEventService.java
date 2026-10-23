package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.BandEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BandEventService {
    private final BandEventRepository bandEventRepository;
    private final CurrentUserProvider currentUser;

    public BandEventService(BandEventRepository bandEventRepository, CurrentUserProvider currentUser) {
        this.bandEventRepository = bandEventRepository;
        this.currentUser = currentUser;
    }

    public List<BandEvent> getAllEvents() {
        return bandEventRepository.findAllByAppUser(currentUser.get());
    }

    public BandEvent getEventById(Long id) {
        return bandEventRepository.findByIdAndAppUser(id, currentUser.get())
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
        bandEventRepository.deleteByIdAndAppUser(id, currentUser.get());
    }

    @Transactional
    public BandEvent saveEvent(BandEvent bandEvent) {
        bandEvent.setAppUser(currentUser.get());
        return bandEventRepository.save(bandEvent);
    }

}
