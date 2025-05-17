package com.ojtech.api.config;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.JobStatus;
import com.ojtech.api.model.JobType;
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

import java.time.OffsetDateTime;
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
            com.ojtech.api.model.Profile student = com.ojtech.api.model.Profile.builder()
                .email("student@ojtech.com")
                .password(passwordEncoder.encode("student123"))
                .fullName("Sample Student")
                .role(UserRole.STUDENT)
                .hasCompletedOnboarding(true)
                .enabled(true)
                .build();
            
            // Create employer user
            com.ojtech.api.model.Profile employer = com.ojtech.api.model.Profile.builder()
                .email("employer@ojtech.com")
                .password(passwordEncoder.encode("employer123"))
                .fullName("Sample Employer")
                .role(UserRole.EMPLOYER)
                .hasCompletedOnboarding(true)
                .enabled(true)
                .build();
            
            // Create admin user
            com.ojtech.api.model.Profile admin = com.ojtech.api.model.Profile.builder()
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
            
            // Get employer user
            com.ojtech.api.model.Profile employer = profileRepository.findByEmail("employer@ojtech.com")
                .orElseThrow(() -> new RuntimeException("Employer not found"));
            
            // Create jobs
            Job job1 = Job.builder()
                .title("Software Engineer Intern")
                .description("Join our engineering team for a summer internship focused on web development.")
                .requiredSkills("Java, Spring Boot, React")
                .preferredSkills("Docker, AWS, TypeScript")
                .location("San Francisco, CA")
                .jobType(JobType.INTERNSHIP)
                .status(JobStatus.OPEN)
                .companyName("TechCorp Inc.")
                .companyLogoUrl("https://example.com/logo.png")
                .salaryRange("$20-25/hour")
                .applicationDeadline(OffsetDateTime.now().plusMonths(1))
                .employer(employer)
                .build();
            
            Job job2 = Job.builder()
                .title("Data Science Co-op")
                .description("6-month co-op position working with our data science team on machine learning projects.")
                .requiredSkills("Python, pandas, scikit-learn")
                .preferredSkills("TensorFlow, PyTorch, SQL")
                .location("Boston, MA")
                .jobType(JobType.CO_OP)
                .status(JobStatus.OPEN)
                .companyName("DataInsights LLC")
                .companyLogoUrl("https://example.com/data-logo.png")
                .salaryRange("$22-28/hour")
                .applicationDeadline(OffsetDateTime.now().plusMonths(2))
                .employer(employer)
                .build();
            
            Job job3 = Job.builder()
                .title("UX/UI Design Internship")
                .description("Help design user interfaces for our mobile and web applications.")
                .requiredSkills("Figma, Adobe XD, UI/UX principles")
                .preferredSkills("HTML/CSS, JavaScript, Prototyping")
                .location("Remote")
                .jobType(JobType.INTERNSHIP)
                .status(JobStatus.OPEN)
                .companyName("DesignFirst Co.")
                .companyLogoUrl("https://example.com/design-logo.png")
                .salaryRange("$18-22/hour")
                .applicationDeadline(OffsetDateTime.now().plusWeeks(3))
                .employer(employer)
                .build();
            
            jobRepository.saveAll(List.of(job1, job2, job3));
        }
    }
} 