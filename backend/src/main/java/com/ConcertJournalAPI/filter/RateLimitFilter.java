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
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int REQUESTS_PER_MINUTE = 60;
    private static final int AUTH_REQUESTS_PER_MINUTE = 5;
    private static final int MAX_TRACKED_IPS = 10_000;

    // LRU cache: evicts oldest entries when MAX_TRACKED_IPS is exceeded
    @SuppressWarnings("serial")
    private final Map<String, RateLimiter> limiters = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, RateLimiter> eldest) {
            return size() > MAX_TRACKED_IPS;
        }
    };

    @SuppressWarnings("serial")
    private final Map<String, RateLimiter> authLimiters = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, RateLimiter> eldest) {
            return size() > MAX_TRACKED_IPS;
        }
    };

    private RateLimiter createRateLimiter(String key) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(REQUESTS_PER_MINUTE)
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .timeoutDuration(Duration.ofSeconds(0))
                .build();
        
        return RateLimiter.of(key + "-limiter", config);
    }

    private RateLimiter createAuthRateLimiter(String key) {
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(AUTH_REQUESTS_PER_MINUTE)
                .limitRefreshPeriod(Duration.ofMinutes(1))
                .timeoutDuration(Duration.ofSeconds(0))
                .build();

        return RateLimiter.of(key + "-auth-limiter", config);
    }

    private synchronized RateLimiter getRateLimiter(String key) {
        return limiters.computeIfAbsent(key, k -> createRateLimiter(k));
    }

    private synchronized RateLimiter getAuthRateLimiter(String key) {
        return authLimiters.computeIfAbsent(key, k -> createAuthRateLimiter(k));
    }

    private boolean isAuthEndpoint(String path) {
        return path.equals("/api/login") || path.equals("/api/register");
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Only use remoteAddr to prevent IP spoofing via headers.
        // If behind a trusted reverse proxy, configure Spring's ForwardedHeaderFilter instead.
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String clientIdentifier = getClientIdentifier(request);
        String path = request.getRequestURI();
        RateLimiter rateLimiter = isAuthEndpoint(path) ? getAuthRateLimiter(clientIdentifier) : getRateLimiter(clientIdentifier);

        try {
            rateLimiter.executeRunnable(() -> {
                try {
                    filterChain.doFilter(request, response);
                } catch (IOException | ServletException e) {
                    throw new RuntimeException(e);
                }
            });
        } catch (RequestNotPermitted e) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
        }
    }
}