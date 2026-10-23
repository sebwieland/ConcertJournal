package com.ConcertJournalAPI.filter;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RateLimitFilterTest {

    private final RateLimitFilter filter = new RateLimitFilter();

    private MockHttpServletRequest request(String clientIp) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/allEvents");
        request.setRemoteAddr(clientIp);
        return request;
    }

    @Test
    public void testRequestsBelowLimitPass() throws Exception {
        String ip = "203.0.113.10";
        for (int i = 0; i < 300; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            AtomicInteger chainCalls = new AtomicInteger();
            MockFilterChain chain = new MockFilterChain() {
                @Override
                public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res)
                        throws java.io.IOException, jakarta.servlet.ServletException {
                    chainCalls.incrementAndGet();
                }
            };
            filter.doFilter(request(ip), response, chain);
            assertEquals(200, response.getStatus(), "request " + i + " should pass");
            assertEquals(1, chainCalls.get());
        }
    }

    @Test
    public void testRequestsBeyondLimitReturnClean429() throws Exception {
        String ip = "203.0.113.11";
        for (int i = 0; i < 300; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request(ip), response, new MockFilterChain());
            assertTrue(response.getStatus() < 400 || response.getStatus() == 429,
                    "request " + i + " status " + response.getStatus());
        }

        AtomicInteger chainCalls = new AtomicInteger();
        MockFilterChain chain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res)
                    throws java.io.IOException, jakarta.servlet.ServletException {
                chainCalls.incrementAndGet();
            }
        };
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request(ip), response, chain);

        // Regression: throttled requests previously surfaced as 500 + full
        // stacktrace because executeRunnable throws RequestNotPermitted
        // directly, which the old cause-based catch never matched.
        assertEquals(429, response.getStatus());
        assertEquals("60", response.getHeader("Retry-After"));
        assertEquals(0, chainCalls.get(), "chain must not run for throttled requests");
    }

    @Test
    public void testDifferentClientsHaveSeparateBuckets() throws Exception {
        String throttledIp = "203.0.113.12";
        for (int i = 0; i < 300; i++) {
            filter.doFilter(request(throttledIp), new MockHttpServletResponse(), new MockFilterChain());
        }
        MockHttpServletResponse otherClient = new MockHttpServletResponse();
        filter.doFilter(request("198.51.100.7"), otherClient, new MockFilterChain());
        assertEquals(200, otherClient.getStatus());
    }

    @Test
    public void testForwardedHeadersCannotSelectAFreshBucket() throws Exception {
        String attacker = "203.0.113.13";
        for (int i = 0; i < 300; i++) {
            filter.doFilter(request(attacker), new MockHttpServletResponse(), new MockFilterChain());
        }
        MockHttpServletRequest spoofed = request(attacker);
        spoofed.addHeader("X-Forwarded-For", "192.0.2.99");
        spoofed.addHeader("X-Real-IP", "192.0.2.100");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(spoofed, response, new MockFilterChain());
        assertEquals(429, response.getStatus(), "spoofed headers must not bypass the limit");
    }

    @Test
    public void testIdleBucketsAreEvicted() throws Exception {
        AtomicLong now = new AtomicLong(0);
        RateLimitFilter clocked = new RateLimitFilter(now::get);
        for (int i = 0; i < 50; i++) {
            clocked.doFilter(request("10.0.0." + i), new MockHttpServletResponse(), new MockFilterChain());
        }
        assertEquals(50, clocked.trackedClients());

        now.set(Duration.ofMinutes(1).toMillis());
        clocked.doFilter(request("10.0.1.1"), new MockHttpServletResponse(), new MockFilterChain());
        assertEquals(1, clocked.trackedClients(), "only the active client should remain");
    }
}
