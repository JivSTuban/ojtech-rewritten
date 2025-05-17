package com.ojtech.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    /**
     * Configure the ObjectMapper to support Java 8 date/time types like OffsetDateTime
     * which are used in the Profile and other model classes.
     * 
     * This configuration ensures that:
     * 1. JavaTimeModule is registered to handle date/time types
     * 2. Dates are not serialized as timestamps but as ISO strings
     * 3. Empty beans are allowed to be serialized
     * 
     * @return Properly configured ObjectMapper
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Register the JavaTimeModule to handle Java 8 date/time types
        objectMapper.registerModule(new JavaTimeModule());
        
        // Configure date/time serialization to use ISO format instead of timestamps
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        
        // Allow empty beans to be serialized (useful for DTOs)
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        return objectMapper;
    }
} 