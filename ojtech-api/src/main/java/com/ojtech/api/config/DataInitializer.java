package com.ojtech.api.config;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;
import com.ojtech.api.model.Profile;
import com.ojtech.api.model.UserRole;
import com.ojtech.api.repository.JobRepository;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@org.springframework.context.annotation.Profile("dev") // Only run in dev profile
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ProfileRepository profileRepository, JobRepository jobRepository, PasswordEncoder passwordEncoder) {
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        
        // Create users if they don't exist
        createUsersIfNotExist();
        
        // Create jobs if they don't exist
        createJobsIfNotExist();
        
    }
    
    private void createUsersIfNotExist() {
        if (profileRepository.count() == 0) {
            
            // Create student user
            Profile student = Profile.builder()
                .email("student@ojtech.com")
                .password(passwordEncoder.encode("student123"))
                .fullName("Sample Student")
                .role(UserRole.STUDENT)
                .hasCompletedOnboarding(true)
                .enabled(true)
                .build();
            
            // Create employer user
            Profile employer = Profile.builder()
                .email("employer@ojtech.com")
                .password(passwordEncoder.encode("employer123"))
                .fullName("Sample Employer")
                .role(UserRole.EMPLOYER)
                .hasCompletedOnboarding(true)
                .enabled(true)
                .build();
            
            // Create admin user
            Profile admin = Profile.builder()
                .email("admin@ojtech.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Admin User")
                .role(UserRole.ADMIN)
                .hasCompletedOnboarding(true)
                .enabled(true)
                .build();
            
            profileRepository.saveAll(List.of(student, employer, admin));
        }
    }
    
    private void createJobsIfNotExist() {
        if (jobRepository.count() == 0) {
            
            // Get employer profile
            Profile employerProfile = profileRepository.findByEmail("employer@ojtech.com")
                .orElseThrow(() -> new RuntimeException("Employer profile not found for email: employer@ojtech.com"));
            
            // Instead of trying to get a User from Profile, we'll just use the Profile directly
            // since our Job model has been updated to work with it

            // Create jobs
            Job job1 = Job.builder()
                .title("Software Engineer Intern")
                .description("Join our engineering team for a summer internship focused on web development.")
                .skillsRequired(List.of("Java", "Spring Boot", "React"))
                .location("San Francisco, CA")
                .jobType("INTERNSHIP")
                .isActive(true)
                .salaryRange("$20-25/hour")
                .closingDate(LocalDateTime.now().plusMonths(1))
                .employer(employerProfile) // Changed to use Profile directly 
                .build();
            
            Job job2 = Job.builder()
                .title("Data Science Co-op")
                .description("6-month co-op position working with our data science team on machine learning projects.")
                .skillsRequired(List.of("Python", "pandas", "scikit-learn"))
                .location("Boston, MA")
                .jobType("CO_OP")
                .isActive(true)
                .salaryRange("$22-28/hour")
                .closingDate(LocalDateTime.now().plusMonths(2))
                .employer(employerProfile)
                .build();
            
            Job job3 = Job.builder()
                .title("UX/UI Design Internship")
                .description("Help design user interfaces for our mobile and web applications.")
                .skillsRequired(List.of("Figma", "Adobe XD", "UI/UX principles"))
                .location("Remote")
                .jobType("INTERNSHIP")
                .isActive(true)
                .salaryRange("$18-22/hour")
                .closingDate(LocalDateTime.now().plusWeeks(3))
                .employer(employerProfile)
                .build();
            
            jobRepository.saveAll(List.of(job1, job2, job3));
        }
    }
} 