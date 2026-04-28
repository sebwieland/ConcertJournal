package com.ConcertJournalAPI;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.model.BandEvent;
import com.ConcertJournalAPI.repository.BandEventRepository;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@Component
@Profile("dev")
public class DataLoader implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataLoader.class);
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final BandEventRepository bandEventRepository;
    private final Environment environment;

    @Autowired
    public DataLoader(AppUserRepository appUserRepository,
                      PasswordEncoder passwordEncoder,
                      BandEventRepository bandEventRepository,
                      Environment environment) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.bandEventRepository = bandEventRepository;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
//         userRepository.delete(userRepository.findByEmail("admin@example.com"));
        // Check if users already exist
        if (!appUserRepository.existsAppUserByEmail("admin@example.com")) {
            // Create default user
            AppUser user = new AppUser();
            String generatedPassword = UUID.randomUUID().toString().substring(0, 12);
            user.setPassword(passwordEncoder.encode(generatedPassword));
            user.setRole("ADMIN");
            user.setEmail("admin@example.com");
            appUserRepository.save(user);

            LOGGER.info("Default admin user created with email 'admin@example.com' and password '{}'", generatedPassword);
        } else {
            LOGGER.info("Default admin user already exists");
        }

        // Generate test data for both H2 and MySQL databases when no events exist
        String datasourceUrl = environment.getProperty("spring.datasource.url");
        if (datasourceUrl != null) {
            // Get the admin user to associate with test events
            AppUser adminUser = appUserRepository.findByEmail("admin@example.com");
            
            if (adminUser != null) {
                // Check if the admin user has any events
                List<BandEvent> adminEvents = bandEventRepository.findAllByAppUser(adminUser);
                
                // Generate 10 test events if admin has no events
                if (adminEvents.size() < 10) {
                    IntStream.range(adminEvents.size(), 10)
                            .forEach(i -> {
                                BandEvent event = createDummyBandEvent(i);
                                event.setAppUser(adminUser);
                                bandEventRepository.save(event);
                            });
                    LOGGER.info("Generated 10 test concert events for admin user in {} database",
                        datasourceUrl.contains("h2") ? "H2" : "MySQL");
                } else {
                    LOGGER.info("Admin user already has {} events, skipping test data generation", adminEvents.size());
                }
            } else {
                LOGGER.warn("Admin user not found, cannot generate test events");
            }
        }
    }


    private BandEvent createDummyBandEvent(int index) {
        BandEvent dummyEvent = new BandEvent();
        dummyEvent.setBandName("Bandname" + (index + 1));
        dummyEvent.setPlace("here" + (index + 1));
        dummyEvent.setDate(LocalDate.now());
        dummyEvent.setRating(0);
        dummyEvent.setComment("comment" + (index + 1));
        dummyEvent.setCreationDate(Instant.now());
        dummyEvent.setModificationDate(Instant.now());
        return dummyEvent;
    }


}
