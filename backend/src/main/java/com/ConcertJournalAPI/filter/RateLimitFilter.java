package com.ConcertJournalAPI.filter;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Generous across a whole IP: SPA page loads burst index + several chunks
    // + fonts + API calls through one socket — 60/min 500-blocked legit users
    // (E2E smoke caught it: every container request shares one limiter).
    private static final int REQUESTS_PER_MINUTE = 300;
    private static final Duration REFRESH_PERIOD = Duration.ofMinutes(1);

    private record Bucket(RateLimiter limiter, long lastSeenMillis) {}

    private final Map<String, Bucket> limiters = new ConcurrentHashMap<>();
    private final LongSupplier clock;
    private volatile long lastSweepMillis;

    public RateLimitFilter() {
        this(System::currentTimeMillis);
    }

    RateLimitFilter(LongSupplier clock) {
        this.clock = clock;
        this.lastSweepMillis = clock.getAsLong();
    }

    private RateLimiter createRateLimiter(String key) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(REQUESTS_PER_MINUTE)
                .limitRefreshPeriod(REFRESH_PERIOD)
                .timeoutDuration(Duration.ofSeconds(0))
                .build();

        return RateLimiter.of(key + "-limiter", config);
    }

    private RateLimiter getRateLimiter(String key) {
        long now = clock.getAsLong();
        sweepIdleBuckets(now);
        return limiters.compute(key, (k, existing) -> new Bucket(
                existing != null ? existing.limiter() : createRateLimiter(k), now)).limiter();
    }

    /**
     * A bucket idle for a full refresh period has refilled completely, so
     * dropping it is indistinguishable from keeping it. Without this the map
     * grows with every client address ever seen (IPv6 rotation, scanners).
     */
    private void sweepIdleBuckets(long now) {
        long idleCutoff = REFRESH_PERIOD.toMillis();
        if (now - lastSweepMillis < idleCutoff) {
            return;
        }
        lastSweepMillis = now;
        limiters.values().removeIf(bucket -> now - bucket.lastSeenMillis() >= idleCutoff);
    }

    int trackedClients() {
        return limiters.size();
    }

    /**
     * Deliberately only the socket peer: X-Forwarded-For / X-Real-IP are
     * client-controlled, and trusting them let anyone pick a fresh bucket per
     * request (risk R5). Behind a reverse proxy, server.forward-headers-strategy=native
     * makes Tomcat's RemoteIpValve rewrite remoteAddr — but only when the
     * header arrives from an internal proxy address.
     */
    private String getClientIdentifier(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIdentifier = getClientIdentifier(request);
        RateLimiter rateLimiter = getRateLimiter(clientIdentifier);

        try {
            rateLimiter.executeRunnable(() -> {
                try {
                    filterChain.doFilter(request, response);
                } catch (IOException | ServletException e) {
                    throw new RuntimeException(e);
                }
            });
        } catch (RequestNotPermitted e) {
            // executeRunnable throws RequestNotPermitted directly when the
            // bucket is empty (timeoutDuration=0). A previous catch checked
            // e.getCause() only and never matched, so every throttled request
            // surfaced as a 500 with a full stacktrace instead of a 429.
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\"}");
        } catch (RuntimeException e) {
            Throwable cause = e.getCause();
            if (cause instanceof ServletException || cause instanceof IOException) {
                if (cause instanceof ServletException servletException) {
                    throw servletException;
                }
                throw (IOException) cause;
            }
            throw e;
        }
    }
}
