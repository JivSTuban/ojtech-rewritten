package com.melardev.spring.jwtoauth.config;

import com.melardev.spring.jwtoauth.service.CloudinaryService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Configuration
@Profile("test")
public class TestConfig {

    @Bean
    public CloudinaryService cloudinaryService() {
        return new CloudinaryService() {
            @Override
            public Map upload(MultipartFile file, String folder) throws IOException {
                Map<String, Object> result = new HashMap<>();
                result.put("public_id", "test-public-id");
                result.put("secure_url", "https://example.com/test-image.jpg");
                return result;
            }

            @Override
            public void delete(String publicId) throws IOException {
                // Do nothing in test environment
            }
        };
    }
} 