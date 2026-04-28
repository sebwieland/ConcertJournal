package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.dto.ChangePasswordRequest;
import com.ConcertJournalAPI.dto.RegisterRequest;
import com.ConcertJournalAPI.exception.ConflictException;
import com.ConcertJournalAPI.exception.ResourceNotFoundException;
import com.ConcertJournalAPI.exception.UnauthorizedException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public UserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    public AppUser registerUser(RegisterRequest request) {
        if (appUserRepository.findByEmail(request.getEmail()) != null) {
            throw new ConflictException("User already exists");
        }
        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("USER");
        return appUserRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);

        // Revoke all refresh tokens to force re-login on all devices
        refreshTokenService.revokeAllForUser(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        AppUser user = appUserRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        // Cascade deletes events and refresh tokens
        appUserRepository.delete(user);
    }
}
