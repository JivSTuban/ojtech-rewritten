package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.responses.JobApplicationResponseDTO;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.exceptions.BadRequestException;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.JobApplicationRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CVRepository cvRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobApplicationResponseDTO>> getStudentApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();
        List<JobApplication> applications = jobApplicationRepository.findByStudent(studentProfile);
        List<JobApplicationResponseDTO> responseDTOs = applications.stream()
            .map(JobApplicationResponseDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<JobApplicationResponseDTO>> getJobApplications(@PathVariable UUID jobId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }

        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        if (!job.getEmployer().getUser().getId().equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        List<JobApplication> applications = jobApplicationRepository.findByJob(job);
        List<JobApplicationResponseDTO> responseDTOs = applications.stream()
            .map(JobApplicationResponseDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(@PathVariable UUID jobId, @RequestBody Map<String, String> applicationData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }

        Job job = jobOpt.get();

        // Check if already applied
        Optional<JobApplication> existingApplication = jobApplicationRepository.findByStudentAndJob(studentProfile, job);
        if (existingApplication.isPresent()) {
            throw new BadRequestException("You have already applied for this job");
        }

        // Get CV
        UUID cvId = null;
        if (applicationData.containsKey("cvId")) {
            cvId = UUID.fromString(applicationData.get("cvId"));
        } else if (studentProfile.getActiveCvId() != null) {
            cvId = studentProfile.getActiveCvId();
        } else {
            throw new BadRequestException("No CV provided or set as active");
        }

        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResourceNotFoundException("CV not found");
        }

        CV cv = cvOpt.get();

        // Create application
        JobApplication application = new JobApplication();
        application.setStudent(studentProfile);
        application.setJob(job);
        application.setCv(cv);
        application.setCoverLetter(applicationData.getOrDefault("coverLetter", ""));
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());
        application.setLastUpdatedAt(LocalDateTime.now());

        application = jobApplicationRepository.save(application);

        return ResponseEntity.ok(new JobApplicationResponseDTO(application));
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable UUID applicationId, @RequestBody Map<String, String> statusData) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        Job job = application.getJob();
        
        // Check if the employer owns the job
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        if (!job.getEmployer().getUser().getId().equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        // Update status
        String statusStr = statusData.get("status");
        if (statusStr == null) {
            throw new BadRequestException("Status is required");
        }

        try {
            ApplicationStatus status = ApplicationStatus.valueOf(statusStr.toUpperCase());
            application.setStatus(status);
            
            // Add feedback if provided
            if (statusData.containsKey("feedback")) {
                application.setFeedback(statusData.get("feedback"));
            }
            
            application.setLastUpdatedAt(LocalDateTime.now());
            application = jobApplicationRepository.save(application);
            
            return ResponseEntity.ok(new JobApplicationResponseDTO(application));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status value");
        }
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('EMPLOYER')")
    public ResponseEntity<JobApplicationResponseDTO> getApplicationById(@PathVariable UUID applicationId) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        
        // Check if the user is authorized to view this application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        // Students can only view their own applications
        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
            if (studentProfileOpt.isEmpty() || !application.getStudent().getId().equals(studentProfileOpt.get().getId())) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        // Employers can only view applications for their jobs
        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYER"))) {
            if (!application.getJob().getEmployer().getUser().getId().equals(userId)) {
                return ResponseEntity.badRequest().build();
            }
        }

        return ResponseEntity.ok(new JobApplicationResponseDTO(application));
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> withdrawApplication(@PathVariable UUID applicationId) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty() || !application.getStudent().getId().equals(studentProfileOpt.get().getId())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Only allow withdrawal if status is PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Cannot withdraw application that is already being processed");
        }

        jobApplicationRepository.delete(application);
        
        return ResponseEntity.ok(new MessageResponse("Application withdrawn successfully"));
    }
} 