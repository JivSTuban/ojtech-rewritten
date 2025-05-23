package com.melardev.spring.jwtoauth.seeds;

import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Component
@Profile("!test") // Don't run this seeder in test profile
public class DatabaseSeeder implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CVRepository cvRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private PlatformTransactionManager transactionManager;

    @Override
    public void run(String... args) throws Exception {
        try {
            TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
            
            // Start with roles and users which are essential
            seedRoles();
            seedUsers();
            
            // Use separate transactions for the rest to isolate failures
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedProfiles();
                    } catch (Exception e) {
                        logger.error("Error seeding profiles: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedJobs();
                    } catch (Exception e) {
                        logger.error("Error seeding jobs: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        seedApplications();
                    } catch (Exception e) {
                        logger.error("Error seeding applications: {}", e.getMessage());
                        status.setRollbackOnly();
                    }
                }
            });
            
            logger.info("Database seeding completed successfully");
        } catch (Exception e) {
            logger.error("Error during database seeding: {}", e.getMessage());
            // Don't rethrow the exception to allow the application to start
        }
    }

    private void seedRoles() {
        try {
            if (roleRepository.count() == 0) {
                logger.info("Seeding roles");
                Role studentRole = new Role(ERole.ROLE_STUDENT);
                Role employerRole = new Role(ERole.ROLE_EMPLOYER);
                Role adminRole = new Role(ERole.ROLE_ADMIN);

                roleRepository.saveAll(Arrays.asList(studentRole, employerRole, adminRole));
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed roles: {}", e.getMessage());
        }
    }

    private void seedUsers() {
        try {
            if (userRepository.count() == 0) {
                logger.info("Seeding users");
                // Create admin user
                User adminUser = new User("admin", "admin@ojtech.com", passwordEncoder.encode("password"));
                Role adminRole = getOrCreateRole(ERole.ROLE_ADMIN);
                adminUser.getRoles().add(adminRole);
                userRepository.save(adminUser);

                // Create student user
                User studentUser = new User("student", "student@ojtech.com", passwordEncoder.encode("password"));
                Role studentRole = getOrCreateRole(ERole.ROLE_STUDENT);
                studentUser.getRoles().add(studentRole);
                userRepository.save(studentUser);

                // Create employer user
                User employerUser = new User("employer", "employer@ojtech.com", passwordEncoder.encode("password"));
                Role employerRole = getOrCreateRole(ERole.ROLE_EMPLOYER);
                employerUser.getRoles().add(employerRole);
                userRepository.save(employerUser);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed users: {}", e.getMessage());
        }
    }

    private Role getOrCreateRole(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role(roleName);
                    return roleRepository.save(newRole);
                });
    }

    private void seedProfiles() {
        try {
            // Check if tables exist before attempting to seed
            try {
                studentProfileRepository.count();
                employerProfileRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Student or employer profiles tables do not exist yet. Skipping profile seeding.");
                return;
            }
            
            if (studentProfileRepository.count() == 0 && employerProfileRepository.count() == 0) {
                logger.info("Seeding profiles");
                // Create student profile
                User studentUser = userRepository.findByUsername("student")
                        .orElseThrow(() -> new RuntimeException("User not found"));

                StudentProfile studentProfile = new StudentProfile();
                studentProfile.setUser(studentUser);
                studentProfile.setFullName("John Doe");
                studentProfile.setFirstName("John");
                studentProfile.setLastName("Doe");
                studentProfile.setUniversity("Example University");
                studentProfile.setMajor("Computer Science");
                studentProfile.setGraduationYear(2024);
                studentProfile.setPhoneNumber("123-456-7890");
                studentProfile.setBio("A passionate student looking for opportunities");
                studentProfile.setGithubUrl("https://github.com/johndoe");
                studentProfile.setLinkedinUrl("https://linkedin.com/in/johndoe");
                studentProfile.setPortfolioUrl("https://johndoe.com");
                studentProfile.setSkills("Java,Spring Boot,React");
                studentProfile.setAvatarUrl("https://example.com/avatar.jpg");
                studentProfileRepository.save(studentProfile);

                // Only attempt to create CV if we could access the table
                try {
                    cvRepository.count(); // Check if table exists
                    
                    // Create CV for student without using repository querying first
                    CV cv = new CV();
                    cv.setStudent(studentProfile);
                    cv.setActive(true);
                    cv.setGenerated(true);
                    cv.setLastUpdated(LocalDateTime.now());
                    cv.setParsedResume("{\"seedData\": true, \"message\": \"This is a sample AI-generated resume\"}");
                    
                    CV savedCV = cvRepository.save(cv);
                    
                    // Only update the student profile if we successfully saved the CV
                    if (savedCV != null && savedCV.getId() != null) {
                        studentProfile.setActiveCvId(savedCV.getId());
                        studentProfileRepository.save(studentProfile);
                        logger.info("Successfully created CV with ID: {}", savedCV.getId());
                    }
                } catch (Exception e) {
                    logger.warn("Could not create CV: {}", e.getMessage());
                    // Continue despite CV creation failure
                }

                // Create employer profile
                User employerUser = userRepository.findByUsername("employer")
                        .orElseThrow(() -> new RuntimeException("User not found"));

                EmployerProfile employerProfile = new EmployerProfile();
                employerProfile.setUser(employerUser);
                employerProfile.setFullName("Tech Company Inc.");
                employerProfile.setCompanyName("Tech Company Inc.");
                employerProfile.setCompanySize("50-100");
                employerProfile.setIndustry("Technology");
                employerProfile.setLocation("San Francisco, CA");
                employerProfile.setCompanyDescription("A leading technology company");
                employerProfile.setWebsiteUrl("https://techcompany.com");
                employerProfile.setLogoUrl("https://example.com/logo.png");
                employerProfileRepository.save(employerProfile);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed profiles: {}", e.getMessage());
        }
    }

    private void seedJobs() {
        try {
            // Check if job table exists before attempting to seed
            try {
                jobRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Jobs table does not exist yet. Skipping job seeding.");
                return;
            }
            
            if (jobRepository.count() == 0) {
                logger.info("Seeding jobs");
                List<EmployerProfile> employers = employerProfileRepository.findAll();
                if (employers.isEmpty()) {
                    return; // Skip if no employers exist
                }
                
                EmployerProfile employer = employers.get(0);

                Job job1 = new Job();
                job1.setEmployer(employer);
                job1.setTitle("Software Engineer");
                job1.setDescription("We are looking for a skilled software engineer to join our team.");
                job1.setLocation("San Francisco, CA");
                job1.setRequiredSkills("Java,Spring Boot,React");
                job1.setEmploymentType("Full-time");
                job1.setMinSalary(80000.0);
                job1.setMaxSalary(120000.0);
                job1.setCurrency("USD");
                job1.setPostedAt(LocalDateTime.now());
                job1.setActive(true);
                jobRepository.save(job1);

                Job job2 = new Job();
                job2.setEmployer(employer);
                job2.setTitle("Frontend Developer");
                job2.setDescription("Join our team as a frontend developer working with React.");
                job2.setLocation("Remote");
                job2.setRequiredSkills("HTML,CSS,JavaScript,React");
                job2.setEmploymentType("Full-time");
                job2.setMinSalary(70000.0);
                job2.setMaxSalary(100000.0);
                job2.setCurrency("USD");
                job2.setPostedAt(LocalDateTime.now().minusDays(5));
                job2.setActive(true);
                jobRepository.save(job2);
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed jobs: {}", e.getMessage());
        }
    }

    private void seedApplications() {
        try {
            // Check if job application and CV tables exist before attempting to seed
            try {
                jobApplicationRepository.count();
                cvRepository.count();
            } catch (DataAccessException e) {
                logger.warn("Job applications or CV table does not exist yet. Skipping applications seeding.");
                return;
            }
            
            if (jobApplicationRepository.count() == 0) {
                logger.info("Seeding job applications");
                List<StudentProfile> students = studentProfileRepository.findAll();
                List<Job> jobs = jobRepository.findAll();
                
                if (students.isEmpty() || jobs.isEmpty()) {
                    logger.warn("No students or jobs found, skipping application seeding.");
                    return; // Skip if no students or jobs exist
                }
                
                StudentProfile student = students.get(0);
                
                // Find CV differently - by using the activeCvId from the student profile
                CV cv = null;
                if (student.getActiveCvId() != null) {
                    try {
                        cv = cvRepository.findById(student.getActiveCvId()).orElse(null);
                        if (cv != null) {
                            logger.info("Found existing CV with ID: {}", cv.getId());
                        }
                    } catch (Exception e) {
                        logger.warn("Could not find CV by ID: {}", e.getMessage());
                    }
                }
                
                // If we couldn't find the CV by ID, try to create a new one
                if (cv == null) {
                    try {
                        logger.info("Creating new CV for application seeding");
                        cv = new CV();
                        cv.setStudent(student);
                        cv.setActive(true);
                        cv.setGenerated(true);
                        cv.setLastUpdated(LocalDateTime.now());
                        cv.setParsedResume("{\"seedData\": true, \"message\": \"This is a sample AI-generated resume\"}");
                        cv = cvRepository.save(cv);
                        
                        student.setActiveCvId(cv.getId());
                        studentProfileRepository.save(student);
                        logger.info("Created new CV with ID: {}", cv.getId());
                    } catch (Exception e) {
                        logger.warn("Could not create CV for application: {}", e.getMessage());
                        return; // Skip if we can't create a CV
                    }
                }

                try {
                    JobApplication application = new JobApplication();
                    application.setStudent(student);
                    application.setJob(jobs.get(0));
                    application.setCv(cv);
                    application.setCoverLetter("I am very interested in this position and believe my skills are a great match.");
                    application.setStatus(ApplicationStatus.PENDING);
                    application.setAppliedAt(LocalDateTime.now().minusDays(2));
                    application.setLastUpdatedAt(LocalDateTime.now().minusDays(2));
                    jobApplicationRepository.save(application);
                    logger.info("Successfully created job application");
                } catch (Exception e) {
                    logger.warn("Could not create job application: {}", e.getMessage());
                }
            }
        } catch (DataAccessException e) {
            logger.warn("Could not seed applications: {}", e.getMessage());
        }
    }
} 