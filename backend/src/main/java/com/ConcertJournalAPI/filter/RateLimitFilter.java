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

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Generous across a whole IP: SPA page loads burst index + several chunks
    // + fonts + API calls through one socket — 60/min 500-blocked legit users
    // (E2E smoke caught it: every container request shares one limiter).
    private static final int REQUESTS_PER_MINUTE = 300;

    private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

    private RateLimiter createRateLimiter(String key) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(REQUESTS_PER_MINUTE)
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .timeoutDuration(Duration.ofSeconds(0))
                .build();

        return RateLimiter.of(key + "-limiter", config);
    }

    private RateLimiter getRateLimiter(String key) {
        return limiters.computeIfAbsent(key, k -> createRateLimiter(k));
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
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