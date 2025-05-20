package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.OJTechApiApplication;
import com.melardev.spring.jwtoauth.dtos.requests.LoginRequest;
import com.melardev.spring.jwtoauth.dtos.requests.SignupRequest;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String employerToken;
    private String studentToken;
    private String jobId;

    @BeforeEach
    void setUp() throws Exception {
        // Ensure roles exist
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_STUDENT));
            roleRepository.save(new Role(ERole.ROLE_EMPLOYER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        // Create an employer user
        String employerUsername = "employer_app" + System.currentTimeMillis();
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
        employerProfile.put("companyName", "Application Test Company");
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
        String studentUsername = "student_app" + System.currentTimeMillis();
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

        // Create student profile
        Map<String, Object> studentProfile = new HashMap<>();
        studentProfile.put("firstName", "Test");
        studentProfile.put("lastName", "Student");
        studentProfile.put("university", "Test University");
        studentProfile.put("major", "Computer Science");
        studentProfile.put("graduationYear", 2024);
        studentProfile.put("phoneNumber", "123-456-7890");
        studentProfile.put("bio", "A test student");

        mockMvc.perform(post("/api/profile/student/onboarding-v2")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentProfile)))
                .andExpect(status().isOk());

        // Create a job
        Map<String, Object> jobData = new HashMap<>();
        jobData.put("title", "Software Engineer - Applications Test");
        jobData.put("description", "A job for a software engineer");
        jobData.put("location", "Remote");
        jobData.put("employmentType", "Full-time");
        jobData.put("minSalary", 80000);
        jobData.put("maxSalary", 120000);
        jobData.put("currency", "USD");
        jobData.put("requiredSkills", "Java,Spring Boot,React");

        MvcResult jobResult = mockMvc.perform(post("/api/jobs")
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobData)))
                .andExpect(status().isOk())
                .andReturn();

        String jobJson = jobResult.getResponse().getContentAsString();
        jobId = objectMapper.readTree(jobJson).get("id").asText();
    }

    @Test
    public void testApplyForJob() throws Exception {
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position");

        mockMvc.perform(post("/api/applications/apply/" + jobId)
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverLetter").value("I am interested in this position"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    public void testGetStudentApplications() throws Exception {
        // Apply for a job first
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position for student applications test");

        mockMvc.perform(post("/api/applications/apply/" + jobId)
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andExpect(status().isOk());

        // Get student applications
        mockMvc.perform(get("/api/applications")
                .header("Authorization", "Bearer " + studentToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    public void testGetJobApplications() throws Exception {
        // Apply for a job first
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position for job applications test");

        mockMvc.perform(post("/api/applications/apply/" + jobId)
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andExpect(status().isOk());

        // Get job applications
        mockMvc.perform(get("/api/applications/job/" + jobId)
                .header("Authorization", "Bearer " + employerToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    public void testUpdateApplicationStatus() throws Exception {
        // Apply for a job first
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position for status update test");

        MvcResult applyResult = mockMvc.perform(post("/api/applications/apply/" + jobId)
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andExpect(status().isOk())
                .andReturn();

        String applicationJson = applyResult.getResponse().getContentAsString();
        String applicationId = objectMapper.readTree(applicationJson).get("id").asText();

        // Update application status
        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("status", "INTERVIEW");

        mockMvc.perform(put("/api/applications/" + applicationId + "/status")
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));
    }

    @Test
    public void testEmployerCannotApplyForJob() throws Exception {
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position");

        mockMvc.perform(post("/api/applications/apply/" + jobId)
                .header("Authorization", "Bearer " + employerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    public void testStudentCannotUpdateApplicationStatus() throws Exception {
        // Apply for a job first
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position for forbidden test");

        MvcResult applyResult = mockMvc.perform(post("/api/applications/apply/" + jobId)
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andExpect(status().isOk())
                .andReturn();

        String applicationJson = applyResult.getResponse().getContentAsString();
        String applicationId = objectMapper.readTree(applicationJson).get("id").asText();

        // Try to update application status as student
        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("status", "ACCEPTED");

        mockMvc.perform(put("/api/applications/" + applicationId + "/status")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
} 