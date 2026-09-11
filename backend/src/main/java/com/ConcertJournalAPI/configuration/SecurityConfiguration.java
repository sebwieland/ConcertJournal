package com.ConcertJournalAPI.configuration;

import com.ConcertJournalAPI.filter.RateLimitFilter;
import com.ConcertJournalAPI.security.AuthFailureHandler;
import com.ConcertJournalAPI.security.AuthSuccessHandler;
import com.ConcertJournalAPI.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.*;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.StringUtils;

import java.util.function.Supplier;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SecurityConfiguration.class);

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Value("${auth.cookie.secure}")
    private boolean secureCookie;

    @Value("${auth.cookie.httpOnly}")
    private boolean httpOnlyCookie;
    
    @Value("${server.servlet.session.cookie.same-site:None}")
    private String sameSiteCookie;

    @Value("${security.headers.hsts.enabled:true}")
    private boolean hstsEnabled;
    @Value("${security.headers.hsts.max-age-seconds:31536000}")
    private int hstsMaxAgeSeconds;
    @Value("${security.headers.hsts.include-sub-domains:true}")
    private boolean hstsIncludeSubDomains;
    @Value("${security.headers.hsts.preload:true}")
    private boolean hstsPreload;

    @Value("${security.headers.csp.enabled:true}")
    private boolean cspEnabled;
    @Value("${security.headers.csp.policy:default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self';}")
    private String cspPolicy;

    @Value("${security.headers.x-frame-options.enabled:true}")
    private boolean frameOptionsEnabled;
    @Value("${security.headers.x-frame-options.policy:SAMEORIGIN}")
    private String frameOptionsPolicy;

    @Value("${security.headers.referrer-policy.enabled:true}")
    private boolean referrerPolicyEnabled;
    @Value("${security.headers.referrer-policy.policy:STRICT_ORIGIN_WHEN_CROSS_ORIGIN}")
    private String referrerPolicyPolicy;

    @Value("${security.headers.permissions-policy.enabled:true}")
    private boolean permissionsPolicyEnabled;
    @Value("${security.headers.permissions-policy.policy:geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()}")
    private String permissionsPolicyPolicy;

    @Value("${cors.enabled:true}")
    private boolean corsEnabled;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        // Log cookie settings to help debug issues
        log.info("Cookie settings - secure: {}, httpOnly: {}, sameSite: {}",
                secureCookie, httpOnlyCookie, sameSiteCookie);
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public AuthSuccessHandler authSuccessHandler() {
        return new AuthSuccessHandler();
    }

    @Bean
    CookieCsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = new CookieCsrfTokenRepository();
        repository.setCookieCustomizer(cookieBuilder -> {
            cookieBuilder.sameSite(sameSiteCookie); // Use configured sameSite value

            // Ensure secure=true when SameSite=None (required by browsers)
            boolean effectiveSecure = secureCookie;
            if ("None".equals(sameSiteCookie)) {
                effectiveSecure = true;
                if (!secureCookie) {
                    log.warn("Forcing secure=true because SameSite=None requires it. Original setting was secure=false.");
                }
            }

            cookieBuilder.secure(effectiveSecure);
            if (StringUtils.hasText(SecurityConstants.cookieDomain)) {
                cookieBuilder.domain(SecurityConstants.cookieDomain);
            }
        });
        repository.setCookieHttpOnly(httpOnlyCookie);
        return repository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.disable())

                // Enable CSRF protection (double submit cookie, BREACH-safe XOR tokens)
                .csrf((csrf) -> csrf
                        .csrfTokenRepository(csrfTokenRepository())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                )

                // OWASP Security Headers
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .headers(headers -> {
                    if (hstsEnabled) {
                        headers.httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .preload(true)
                                .maxAgeInSeconds(31536000));
                    }
                })
                .headers(headers -> {
                    if (cspEnabled) {
                        headers.contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self';"));
                    }
                })
                .headers(headers -> headers
                        .referrerPolicy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .headers(headers -> headers
                        .addHeaderWriter(new org.springframework.security.web.header.writers.PermissionsPolicyHeaderWriter(
                                "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()")))

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID", "refreshToken")
                )

                .formLogin(form -> form
                        .usernameParameter("email")
                        .successHandler(authSuccessHandler())
                        .failureHandler(new AuthFailureHandler())
                        .loginPage("/login")
                )

                // Authorize requests
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/assets/**", "*.js", "*.css", "*.ico", "*.png", "*.svg", "*.woff", "*.woff2", "*.xml", "*.txt", "*.webmanifest").permitAll()
                        // SPA document routes (single-segment, no dot) forward to index.html
                        // via SpaController and must load anonymously — React Router then
                        // handles its own auth gating client-side. Implemented as an
                        // explicit matcher: brace-regex path patterns like
                        // "/{path:[^\\.]*}" are NOT reliably supported by the security
                        // request matcher builders (see regression E2E finding).
                        .requestMatchers(new RequestMatcher() {
                            @Override
                            public boolean matches(jakarta.servlet.http.HttpServletRequest request) {
                                if (!HttpMethod.GET.matches(request.getMethod())) {
                                    return false;
                                }
                                // Works in both servlet containers and MockMvc tests
                                String path = request.getServletPath();
                                if (path.isEmpty()) {
                                    path = request.getRequestURI().substring(request.getContextPath().length());
                                }
                                if (path.startsWith("/api/") || path.startsWith("/actuator") ||
                                        path.startsWith("/assets/") || path.startsWith("/error") ||
                                        path.startsWith("/register") || path.startsWith("/login") ||
                                        path.startsWith("/logout") || path.contains(".")) {
                                    return false;
                                }
                                // single non-root segment only (e.g. /sign-up)
                                String[] segments = path.split("/");
                                return path.length() > 1 && segments.length == 2 && !segments[1].isEmpty();
                            }
                        }).permitAll()
                        .requestMatchers("/error", "/register", "/login", "/logout", "/actuator/health", "/actuator/prometheus", "/api/get-xsrf-cookie", "/api/refresh-token").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .requestMatchers(HttpMethod.OPTIONS).permitAll()
                        .anyRequest().denyAll()
                )
                // Use HTTP Basic Authentication (for simplicity)
                //.httpBasic(withDefaults())

                .exceptionHandling(exceptionHandling -> exceptionHandling
                        // API clients get a proper 401 JSON; browser navigation redirects to /login
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\":\"Unauthorized\"}");
                            } else {
                                new LoginUrlAuthenticationEntryPoint("/login").commence(request, response, authException);
                            }
                        })
                )

                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}


final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {
    private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
        /*
         * Always use XorCsrfTokenRequestAttributeHandler to provide BREACH protection of
         * the CsrfToken when it is rendered in the response body.
         */
        this.delegate.handle(request, response, csrfToken);
    }

    @Override
    public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        /*
         * If the request contains a request header, use CsrfTokenRequestAttributeHandler
         * to resolve the CsrfToken. This applies when a single-page application includes
         * the header value automatically, which was obtained via a cookie containing the
         * raw CsrfToken.
         */
        if (StringUtils.hasText(request.getHeader(csrfToken.getHeaderName()))) {
            return super.resolveCsrfTokenValue(request, csrfToken);
        }
        /*
         * In all other cases (e.g. if the request contains a request parameter), use
         * XorCsrfTokenRequestAttributeHandler to resolve the CsrfToken. This applies
         * when a server-side rendered form includes the _csrf request parameter as a
         * hidden input.
         */
        return this.delegate.resolveCsrfTokenValue(request, csrfToken);
    }
}


