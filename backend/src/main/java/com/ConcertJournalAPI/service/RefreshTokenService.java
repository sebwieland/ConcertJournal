package com.ConcertJournalAPI.service;

import com.ConcertJournalAPI.exception.UnauthorizedException;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.RefreshToken;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.repository.RefreshTokenRepository;
import com.ConcertJournalAPI.security.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository refreshTokenRepository;
    private final AppUserRepository appUserRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, AppUserRepository appUserRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.appUserRepository = appUserRepository;
    }

    /**
     * Create a new refresh token for the given user and token family.
     * Returns the raw JWT string (to be set as a cookie).
     */
    @Transactional
    public String createRefreshToken(AppUser user, String familyId) {
        String rawJwt = JwtUtils.generateRefreshToken(user.getEmail(), user.getRole());
        String hash = sha256Hex(rawJwt);

        RefreshToken entity = new RefreshToken();
        entity.setTokenHash(hash);
        entity.setAppUser(user);
        entity.setFamilyId(familyId);
        entity.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        entity.setCreatedAt(Instant.now());
        refreshTokenRepository.save(entity);

        return rawJwt;
    }

    /**
     * Validate a refresh token and rotate it.
     * Returns a result containing the new refresh JWT, new access JWT, and the user.
     */
    @Transactional
    public RotationResult validateAndRotate(String rawJwt) {
        // Parse the JWT to verify signature and expiry
        Claims claims;
        try {
            claims = JwtUtils.parseToken(rawJwt);
        } catch (JwtException e) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String tokenType = claims.get("type", String.class);
        if (!JwtUtils.TOKEN_TYPE_REFRESH.equals(tokenType)) {
            throw new UnauthorizedException("Token is not a refresh token");
        }

        // Look up the token in the database
        String hash = sha256Hex(rawJwt);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not recognized"));

        // Check for reuse of a revoked token (indicates theft)
        if (storedToken.isRevoked()) {
            log.warn("Reuse of revoked refresh token detected for family {}. Revoking entire family.", storedToken.getFamilyId());
            refreshTokenRepository.revokeByFamilyId(storedToken.getFamilyId());
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        // Revoke the old token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Verify the user still exists
        AppUser user = storedToken.getAppUser();
        if (user == null) {
            throw new UnauthorizedException("User no longer exists");
        }
        // Re-fetch to ensure user is up to date
        user = appUserRepository.findByEmail(user.getEmail());
        if (user == null) {
            throw new UnauthorizedException("User no longer exists");
        }

        // Create a new refresh token in the same family
        String newRefreshJwt = createRefreshToken(user, storedToken.getFamilyId());
        String newAccessJwt = JwtUtils.generateToken(user.getEmail(), user.getRole());

        return new RotationResult(newAccessJwt, newRefreshJwt, user);
    }

    /**
     * Revoke all refresh tokens for a user (used on logout and password change).
     */
    @Transactional
    public void revokeAllForUser(AppUser user) {
        refreshTokenRepository.revokeAllByUser(user);
    }

    /**
     * Generate a new token family ID.
     */
    public String newFamilyId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Clean up expired refresh tokens daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpired() {
        refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
        log.info("Cleaned up expired refresh tokens");
    }

    static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Result of a token rotation operation.
     */
    public record RotationResult(String accessToken, String refreshToken, AppUser user) {}
}
