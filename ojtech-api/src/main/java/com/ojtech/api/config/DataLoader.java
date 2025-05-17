package com.ojtech.api.config;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.UserRole;
import com.ojtech.api.repository.ProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DataLoader(ProfileRepository profileRepository, PasswordEncoder passwordEncoder) {
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            // Check if we need to load data
            if (profileRepository.count() == 0) {
                // Create an admin user
                Profile admin = Profile.builder()
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("password"))
                        .fullName("Admin User")
                        .role(UserRole.ADMIN)
                        .hasCompletedOnboarding(true)
                        .build();
                
                profileRepository.save(admin);
                
                // Create a student user
                Profile student = Profile.builder()
                        .email("student@example.com")
                        .password(passwordEncoder.encode("password"))
                        .fullName("Student User")
                        .role(UserRole.STUDENT)
                        .hasCompletedOnboarding(true)
                        .build();
                
                profileRepository.save(student);
                
                // Create an employer user
                Profile employer = Profile.builder()
                        .email("employer@example.com")
                        .password(passwordEncoder.encode("password"))
                        .fullName("Employer User")
                        .role(UserRole.EMPLOYER)
                        .hasCompletedOnboarding(true)
                        .build();
                
                profileRepository.save(employer);
            }
        };
    }
}
