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

    private static final int REQUESTS_PER_MINUTE = 60;
    
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
            runnableWithRateLimit(rateLimiter, () -> {
                try {
                    filterChain.doFilter(request, response);
                } catch (IOException | ServletException e) {
                    throw new RuntimeException(e);
                }
            });
        } catch (RuntimeException e) {
            if (e.getCause() instanceof RequestNotPermitted) {
                response.setStatus(429);
                response.getWriter().write("Too many requests. Please try again later.");
            } else {
                throw e;
            }
        }
    }
    
    private void runnableWithRateLimit(RateLimiter rateLimiter, Runnable runnable) {
        rateLimiter.executeRunnable(runnable);
    }
}