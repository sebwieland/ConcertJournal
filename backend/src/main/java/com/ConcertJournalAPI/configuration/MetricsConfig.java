package com.ConcertJournalAPI.configuration;

import com.ConcertJournalAPI.repository.AppUserRepository;
import com.ConcertJournalAPI.repository.BandEventRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Gauge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class MetricsConfig {

    @Autowired
    private MeterRegistry registry;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private BandEventRepository bandEventRepository;

    @Autowired
    public MetricsConfig(MeterRegistry registry, AppUserRepository appUserRepository, BandEventRepository bandEventRepository) {
        this.registry = registry;
        this.appUserRepository = appUserRepository;
        this.bandEventRepository = bandEventRepository;

        // Register custom metrics
        Gauge.builder("total.users", appUserRepository, AppUserRepository::count)
                .register(registry);

        Gauge.builder("unique.bandEvents", this, MetricsConfig::countUniqueBandEvents)
                .register(registry);
    }

    private double countUniqueBandEvents() {
        Set<String> uniqueBandEvents = bandEventRepository.findAll()
                .stream()
                .map(event -> event.getBandName() + "-" + event.getDate().toString())
                .collect(Collectors.toSet());
        return uniqueBandEvents.size();
    }
}