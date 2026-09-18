package com.ConcertJournalAPI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// No @EnableWebMvc: it disables Spring Boot's MVC auto-configuration, which
// silently dropped all spring.jackson.* settings (its hand-built converters
// used a default ObjectMapper) and cost us ISO date serialization. Boot
// honors WebMvcConfigurer resource handlers natively.

@SpringBootApplication
public class ConcertJournalAPI {
	public static void main(String[] args) {
		SpringApplication.run(ConcertJournalAPI.class, args);
	}
}
