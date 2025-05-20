package com.melardev.spring.jwtoauth.seeds;

import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@Profile("!test") // Don't run this seeder in test profile
public class DatabaseSeeder implements CommandLineRunner {

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

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedUsers();
        seedProfiles();
        seedJobs();
        seedApplications();
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            Role studentRole = new Role(ERole.ROLE_STUDENT);
            Role employerRole = new Role(ERole.ROLE_EMPLOYER);
            Role adminRole = new Role(ERole.ROLE_ADMIN);

            roleRepository.saveAll(Arrays.asList(studentRole, employerRole, adminRole));
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
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
    }

    private Role getOrCreateRole(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role(roleName);
                    return roleRepository.save(newRole);
                });
    }

    private void seedProfiles() {
        if (studentProfileRepository.count() == 0 && employerProfileRepository.count() == 0) {
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

            // Create CV for student
            CV cv = new CV();
            cv.setStudent(studentProfile);
            cv.setFileName("resume.pdf");
            cv.setFileUrl("https://example.com/resume.pdf");
            cv.setFileType("application/pdf");
            cv.setUploadDate(LocalDateTime.now());
            cv.setActive(true);
            cvRepository.save(cv);

            studentProfile.setActiveCvId(cv.getId());
            studentProfileRepository.save(studentProfile);

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
    }

    private void seedJobs() {
        if (jobRepository.count() == 0) {
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
    }

    private void seedApplications() {
        if (jobApplicationRepository.count() == 0) {
            List<StudentProfile> students = studentProfileRepository.findAll();
            List<Job> jobs = jobRepository.findAll();
            
            if (students.isEmpty() || jobs.isEmpty()) {
                return; // Skip if no students or jobs exist
            }
            
            StudentProfile student = students.get(0);
            List<CV> cvs = cvRepository.findByStudent(student);
            
            if (cvs.isEmpty()) {
                return; // Skip if no CVs exist
            }
            
            CV cv = cvs.get(0);

            JobApplication application = new JobApplication();
            application.setStudent(student);
            application.setJob(jobs.get(0));
            application.setCv(cv);
            application.setCoverLetter("I am very interested in this position and believe my skills are a great match.");
            application.setStatus(ApplicationStatus.PENDING);
            application.setAppliedAt(LocalDateTime.now().minusDays(2));
            application.setLastUpdatedAt(LocalDateTime.now().minusDays(2));
            jobApplicationRepository.save(application);
        }
    }
} 