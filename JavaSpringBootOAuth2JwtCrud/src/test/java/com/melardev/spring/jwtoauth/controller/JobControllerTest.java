package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.OJTechApiApplication;
import com.melardev.spring.jwtoauth.dtos.requests.LoginRequest;
import com.melardev.spring.jwtoauth.dtos.requests.SignupRequest;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.entities.UserRole;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JobRepository jobRepository;

    @MockBean
    private EmployerProfileRepository employerProfileRepository;

    @MockBean
    private UserRepository userRepository;

    private String employerToken;
    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        // Ensure roles exist
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_STUDENT));
            roleRepository.save(new Role(ERole.ROLE_EMPLOYER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        // Create an employer user
        String employerUsername = "employer" + System.currentTimeMillis();
        SignupRequest employerSignup = new SignupRequest();
        employerSignup.setUsername(employerUsername);
        employerSignup.setEmail(employerUsername + "@example.com");
        employerSignup.setPassword("password123");
        
        Set<String> employerRoles = new HashSet<>();
        employerRoles.add("employer");
        employerSignup.setRoles(employerRoles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employerSignup)))
                .andExpect(status().isOk());

        // Login as employer
        LoginRequest employerLogin = new LoginRequest();
        employerLogin.setUsernameOrEmail(employerUsername);
        employerLogin.setPassword("password123");

        MvcResult employerResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employerLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String employerJsonContent = employerResult.getResponse().getContentAsString();
        employerToken = objectMapper.readTree(employerJsonContent).get("token").asText();

        // Create employer profile
        Map<String, Object> employerProfile = new HashMap<>();
        employerProfile.put("companyName", "Test Company");
        employerProfile.put("companySize", "10-50");
        employerProfile.put("industry", "Technology");
        employerProfile.put("location", "Test City");
        employerProfile.put("companyDescription", "A test company");
        employerProfile.put("websiteUrl", "https://example.com");

        mockMvc.perform(post("/api/profile/employer/onboarding")
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employerProfile)))
                .andExpect(status().isOk());

        // Create a student user
        String studentUsername = "student" + System.currentTimeMillis();
        SignupRequest studentSignup = new SignupRequest();
        studentSignup.setUsername(studentUsername);
        studentSignup.setEmail(studentUsername + "@example.com");
        studentSignup.setPassword("password123");
        
        Set<String> studentRoles = new HashSet<>();
        studentRoles.add("student");
        studentSignup.setRoles(studentRoles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentSignup)))
                .andExpect(status().isOk());

        // Login as student
        LoginRequest studentLogin = new LoginRequest();
        studentLogin.setUsernameOrEmail(studentUsername);
        studentLogin.setPassword("password123");

        MvcResult studentResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String studentJsonContent = studentResult.getResponse().getContentAsString();
        studentToken = objectMapper.readTree(studentJsonContent).get("token").asText();
    }

    @Test
    public void testGetAllJobs() throws Exception {
        // Setup
        Job job1 = new Job();
        job1.setId(UUID.randomUUID());
        job1.setTitle("Software Engineer");
        job1.setDescription("Job description 1");
        job1.setActive(true);
        job1.setPostedAt(LocalDateTime.now());

        Job job2 = new Job();
        job2.setId(UUID.randomUUID());
        job2.setTitle("Web Developer");
        job2.setDescription("Job description 2");
        job2.setActive(true);
        job2.setPostedAt(LocalDateTime.now().minusDays(1));

        Page<Job> page = new PageImpl<>(Arrays.asList(job1, job2));
        when(jobRepository.findByActive(true, any(Pageable.class))).thenReturn(page);

        // Execute and Verify
        mockMvc.perform(get("/api/jobs")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Software Engineer"))
                .andExpect(jsonPath("$.content[1].title").value("Web Developer"))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    public void testGetJobById() throws Exception {
        // Setup
        UUID jobId = UUID.randomUUID();
        Job job = new Job();
        job.setId(jobId);
        job.setTitle("Software Engineer");
        job.setDescription("Job description");
        job.setActive(true);

        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));

        // Execute and Verify
        mockMvc.perform(get("/api/jobs/" + jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"))
                .andExpect(jsonPath("$.description").value("Job description"));
    }

    @Test
    @WithMockUser(username = "employer", roles = {"EMPLOYER"})
    public void testCreateJob() throws Exception {
        // Setup
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setUsername("employer");

        EmployerProfile employerProfile = new EmployerProfile();
        employerProfile.setId(UUID.randomUUID());
        employerProfile.setUser(user);
        employerProfile.setCompanyName("Test Company");
        employerProfile.setRole(UserRole.EMPLOYER);

        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId,
                "employer",
                "employer@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_EMPLOYER"))
        );

        when(employerProfileRepository.findByUserId(userId)).thenReturn(Optional.of(employerProfile));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> {
            Job savedJob = invocation.getArgument(0);
            savedJob.setId(UUID.randomUUID());
            return savedJob;
        });

        // Create job data
        Map<String, Object> jobData = new HashMap<>();
        jobData.put("title", "Software Engineer");
        jobData.put("description", "We are looking for a skilled software engineer");
        jobData.put("location", "Remote");
        jobData.put("requiredSkills", "Java, Spring Boot");
        jobData.put("employmentType", "Full-time");
        jobData.put("minSalary", 80000);
        jobData.put("maxSalary", 120000);
        jobData.put("currency", "USD");

        // Execute and Verify
        mockMvc.perform(post("/api/jobs")
                .with(SecurityMockMvcRequestPostProcessors.user(userDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"))
                .andExpect(jsonPath("$.description").value("We are looking for a skilled software engineer"))
                .andExpect(jsonPath("$.location").value("Remote"))
                .andExpect(jsonPath("$.requiredSkills").value("Java, Spring Boot"))
                .andExpect(jsonPath("$.employmentType").value("Full-time"))
                .andExpect(jsonPath("$.minSalary").value(80000))
                .andExpect(jsonPath("$.maxSalary").value(120000))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    public void testGetEmployerJobs() throws Exception {
        // Create a job first
        Map<String, Object> jobData = new HashMap<>();
        jobData.put("title", "Backend Developer");
        jobData.put("description", "A job for a backend developer");
        jobData.put("location", "San Francisco");
        jobData.put("employmentType", "Full-time");

        mockMvc.perform(post("/api/jobs")
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobData)))
                .andExpect(status().isOk());

        // Get employer jobs
        mockMvc.perform(get("/api/jobs/employer")
                .header("Authorization", "Bearer " + employerToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testUpdateJob() throws Exception {
        // Create a job first
        Map<String, Object> createData = new HashMap<>();
        createData.put("title", "DevOps Engineer");
        createData.put("description", "A job for a DevOps engineer");
        createData.put("location", "Chicago");
        createData.put("employmentType", "Full-time");

        MvcResult createResult = mockMvc.perform(post("/api/jobs")
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createData)))
                .andExpect(status().isOk())
                .andReturn();

        String jobJson = createResult.getResponse().getContentAsString();
        String jobId = objectMapper.readTree(jobJson).get("id").asText();

        // Update the job
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("title", "Senior DevOps Engineer");
        updateData.put("description", "Updated job description");
        updateData.put("minSalary", 100000);
        updateData.put("maxSalary", 150000);

        mockMvc.perform(put("/api/jobs/" + jobId)
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior DevOps Engineer"))
                .andExpect(jsonPath("$.description").value("Updated job description"))
                .andExpect(jsonPath("$.minSalary").value(100000))
                .andExpect(jsonPath("$.maxSalary").value(150000));
    }

    @Test
    public void testDeleteJob() throws Exception {
        // Create a job first
        Map<String, Object> jobData = new HashMap<>();
        jobData.put("title", "QA Engineer");
        jobData.put("description", "A job for a QA engineer");
        jobData.put("location", "Boston");
        jobData.put("employmentType", "Full-time");

        MvcResult createResult = mockMvc.perform(post("/api/jobs")
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobData)))
                .andExpect(status().isOk())
                .andReturn();

        String jobJson = createResult.getResponse().getContentAsString();
        String jobId = objectMapper.readTree(jobJson).get("id").asText();

        // Delete the job (soft delete)
        mockMvc.perform(delete("/api/jobs/" + jobId)
                .header("Authorization", "Bearer " + employerToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Job deleted successfully"));
    }

    @Test
    public void testStudentCannotCreateJob() throws Exception {
        Map<String, Object> jobData = new HashMap<>();
        jobData.put("title", "Product Manager");
        jobData.put("description", "A job for a product manager");
        jobData.put("location", "Seattle");
        jobData.put("employmentType", "Full-time");

        mockMvc.perform(post("/api/jobs")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobData)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
} 