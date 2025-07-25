package com.ConcertJournalAPI;

import com.ConcertJournalAPI.model.AppUser;
import com.ConcertJournalAPI.repository.BandEventRepository;
import com.ConcertJournalAPI.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DataLoaderTest {

    @InjectMocks
    private DataLoader dataLoader;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private BandEventRepository bandEventRepository;
    
    @Mock
    private Environment environment;

    @Test
    public void testCreateDefaultUser() {
        // Arrange
        when(appUserRepository.existsAppUserByEmail("admin@example.com")).thenReturn(false);
        when(environment.getProperty("spring.datasource.url")).thenReturn("jdbc:h2:mem:testdb");

        // Act
        dataLoader.run();

        // Assert
        verify(appUserRepository, times(1)).save(any(AppUser.class));
    }

    @Test
    public void testDefaultUserAlreadyExists() {
        // Arrange
        when(appUserRepository.existsAppUserByEmail("admin@example.com")).thenReturn(true);
        when(environment.getProperty("spring.datasource.url")).thenReturn("jdbc:h2:mem:testdb");

        // Act
        dataLoader.run();

        // Assert
        verify(appUserRepository, never()).save(any(AppUser.class));
    }

    // Add more tests as needed
}