package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.exception.ResourceNotFoundException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HomeController {

    private final AppUserRepository appUserRepository;

    public HomeController(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public AppUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || "anonymousUser".equals(auth.getName())) {
            throw new ResourceNotFoundException("User not found");
        }
        AppUser user = appUserRepository.findByEmail(auth.getName());
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        return user; // password is @JsonIgnore
    }
}
