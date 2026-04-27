package com.ConcertJournalAPI.configuration;

import com.ConcertJournalAPI.filter.RateLimitFilter;
import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.security.AuthFailureHandler;
import com.ConcertJournalAPI.security.AuthSuccessHandler;
import com.ConcertJournalAPI.security.JwtAuthenticationFilter;
import com.ConcertJournalAPI.security.JwtUtils;
import com.ConcertJournalAPI.service.RefreshTokenService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SecurityConfiguration.class);

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Value("${auth.cookie.secure}")
    private boolean secureCookie;

    @Value("${auth.cookie.same-site:Lax}")
    private String sameSiteCookie;

    @Value("${auth.cookie.domain:}")
    private String cookieDomain;

    @Value("${security.headers.hsts.enabled:true}")
    private boolean hstsEnabled;

    @Value("${security.headers.csp.enabled:true}")
    private boolean cspEnabled;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public AuthSuccessHandler authSuccessHandler() {
        return new AuthSuccessHandler(refreshTokenService, appUserRepository);
    }

    @Bean
    CookieCsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = new CookieCsrfTokenRepository();
        repository.setCookieCustomizer(cookieBuilder -> {
            cookieBuilder.sameSite(sameSiteCookie);
            boolean effectiveSecure = secureCookie;
            if ("None".equals(sameSiteCookie)) {
                effectiveSecure = true;
                if (!secureCookie) {
                    log.warn("Forcing secure=true because SameSite=None requires it.");
                }
            }
            cookieBuilder.secure(effectiveSecure);
            if (cookieDomain != null && !cookieDomain.isEmpty()) {
                cookieBuilder.domain(cookieDomain);
            }
        });
        // CSRF cookie must NOT be HttpOnly -- JavaScript needs to read it for the X-XSRF-TOKEN header
        repository.setCookieHttpOnly(false);
        return repository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.disable())

                .csrf((csrf) -> csrf
                        .csrfTokenRepository(csrfTokenRepository())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                )

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
                                .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self';"));
                    }
                })
                .headers(headers -> headers
                        .referrerPolicy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .headers(headers -> headers
                        .addHeaderWriter(new org.springframework.security.web.header.writers.PermissionsPolicyHeaderWriter(
                                "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()")))

                .logout(logout -> logout
                        .logoutUrl("/api/logout")
                        .addLogoutHandler(refreshTokenLogoutHandler())
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK))
                        .invalidateHttpSession(true)
                        .deleteCookies("refreshToken")
                )

                .formLogin(form -> form
                        .usernameParameter("email")
                        .successHandler(authSuccessHandler())
                        .failureHandler(new AuthFailureHandler())
                        .loginProcessingUrl("/api/login")
                        .loginPage("/sign-in")
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/assets/**", "*.js", "*.css", "*.ico", "*.png", "*.svg", "*.woff", "*.woff2").permitAll()
                        .requestMatchers("/error", "/api/register", "/api/login", "/api/logout", "/api/refresh-token", "/api/get-xsrf-cookie").permitAll()
                        .requestMatchers("/actuator/**").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .requestMatchers(HttpMethod.OPTIONS).permitAll()
                        .anyRequest().permitAll()
                )

                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .defaultAuthenticationEntryPointFor(
                                (request, response, authException) -> response.sendError(HttpStatus.UNAUTHORIZED.value()),
                                request -> request.getRequestURI().startsWith("/api/")
                        )
                        .defaultAuthenticationEntryPointFor(
                                new LoginUrlAuthenticationEntryPoint("/sign-in"),
                                request -> !request.getRequestURI().startsWith("/api/")
                        )
                )

                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Custom logout handler that revokes all refresh tokens for the user.
     * Extracts user identity from the refresh token cookie (works in stateless mode).
     */
    @Bean
    public LogoutHandler refreshTokenLogoutHandler() {
        return (HttpServletRequest request, HttpServletResponse response, Authentication authentication) -> {
            // Try to identify user from refresh token cookie
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("refreshToken".equals(cookie.getName())) {
                        try {
                            Claims claims = JwtUtils.parseToken(cookie.getValue());
                            String email = claims.getSubject();
                            AppUser user = appUserRepository.findByEmail(email);
                            if (user != null) {
                                refreshTokenService.revokeAllForUser(user);
                                log.info("Revoked all refresh tokens for user {} on logout", email);
                            }
                        } catch (Exception e) {
                            log.debug("Could not parse refresh token on logout", e);
                        }
                        break;
                    }
                }
            }
        };
    }
}
