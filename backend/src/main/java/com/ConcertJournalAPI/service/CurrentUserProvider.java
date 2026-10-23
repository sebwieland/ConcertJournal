package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Resolves the authenticated owner — every data access is scoped to it, never to an id alone. */
@Component
public class CurrentUserProvider {
    private final AppUserRepository appUserRepository;

    public CurrentUserProvider(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public AppUser get() {
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
