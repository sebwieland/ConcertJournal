package com.ConcertJournalAPI.controller;

import com.ConcertJournalAPI.service.AccountService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required.")
            String currentPassword,
            @NotBlank(message = "New password is required.")
            @Size(min = 8, message = "New password must be at least 8 characters.")
            String newPassword) {
    }

    public record DeleteAccountRequest(
            @NotBlank(message = "Password is required.")
            String password) {
    }

    @GetMapping("/export")
    public ResponseEntity<AccountService.AccountExport> export() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"concertjournal-export.json\"")
                .body(accountService.export());
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        accountService.changePassword(request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@RequestBody @Valid DeleteAccountRequest request,
                                              HttpServletResponse response) {
        accountService.deleteAccount(request.password());
        // Expire the refresh cookie (set at login with path "/" and no domain)
        Cookie expired = new Cookie("refreshToken", "");
        expired.setPath("/");
        expired.setMaxAge(0);
        expired.setHttpOnly(true);
        response.addCookie(expired);
        return ResponseEntity.noContent().build();
    }
}
