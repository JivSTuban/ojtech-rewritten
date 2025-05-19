package com.ojtech.api.controller;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.EmployerProfile;
import com.ojtech.api.model.Profile;
import com.ojtech.api.payload.request.JobRequest;
import com.ojtech.api.payload.response.JobDetailResponse;
import com.ojtech.api.payload.response.MessageResponse;
import com.ojtech.api.repository.EmployerProfileRepository;
import com.ojtech.api.repository.ProfileRepository;
import com.ojtech.api.security.UserDetailsImpl;
import com.ojtech.api.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs", description = "Job management and listing endpoints")
public class JobController {

    private final JobService jobService;
    private final ProfileRepository profileRepository;
    private final EmployerProfileRepository employerProfileRepository;

    @Autowired
    public JobController(JobService jobService, 
                         ProfileRepository profileRepository, 
                         EmployerProfileRepository employerProfileRepository) {
        this.jobService = jobService;
        this.profileRepository = profileRepository;
        this.employerProfileRepository = employerProfileRepository;
    }

    private UserDetailsImpl getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return (UserDetailsImpl) authentication.getPrincipal();
        }
        return null;
    }

    private UUID getCurrentEmployerProfileId() {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        if (userDetails == null || userDetails.getProfile() == null) {
            throw new RuntimeException("User or base profile not found for current user. Cannot determine employer profile.");
        }
        Profile baseProfile = userDetails.getProfile();
        return employerProfileRepository.findByProfile_Id(baseProfile.getId())
                .map(EmployerProfile::getId)
                .orElseThrow(() -> new RuntimeException("Employer profile not found for user: " + userDetails.getUsername()));
    }

    // --- Employer Job Management Endpoints ---
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Create a new job posting", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> createJob(@Valid @RequestBody JobRequest jobRequest) {
        try {
            UUID employerProfileId = getCurrentEmployerProfileId();
            Job createdJob = jobService.createJobForEmployer(jobRequest, employerProfileId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating job: " + e.getMessage()));
        }
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Update an existing job posting by Job ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> updateJob(@PathVariable UUID jobId, @Valid @RequestBody JobRequest jobRequest) {
        try {
            UUID employerProfileId = getCurrentEmployerProfileId();
            Job updatedJob = jobService.updateJobForEmployer(jobId, jobRequest, employerProfileId);
            return ResponseEntity.ok(updatedJob);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Delete a job posting by Job ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteJob(@PathVariable UUID jobId) {
        try {
            UUID employerProfileId = getCurrentEmployerProfileId();
            jobService.deleteJobForEmployer(jobId, employerProfileId);
            return ResponseEntity.ok(new MessageResponse("Job deleted successfully."));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PatchMapping("/{jobId}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Update job active status by Job ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> updateJobActiveStatus(@PathVariable UUID jobId, @RequestParam boolean isActive) {
        try {
            UUID employerProfileId = getCurrentEmployerProfileId();
            Job updatedJob = jobService.updateJobActiveStatus(jobId, isActive, employerProfileId);
            return ResponseEntity.ok(updatedJob);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get jobs posted by the current employer", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getEmployerJobs(@PageableDefault(size = 10) Pageable pageable) {
        try {
            UUID employerProfileId = getCurrentEmployerProfileId();
            Page<Job> jobs = jobService.getJobsByEmployerProfile(employerProfileId, pageable);
            return ResponseEntity.ok(jobs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-jobs/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get a specific job by ID posted by current employer", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getEmployerJobById(@PathVariable UUID jobId) {
         try {
            UUID employerProfileId = getCurrentEmployerProfileId();
            Optional<Job> job = jobService.getJobByEmployerProfileAndId(employerProfileId, jobId);
            return job.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    // --- Public Job Listing Endpoints ---
    @GetMapping
    @Operation(summary = "Get all public active job postings (paginated)")
    public ResponseEntity<Page<Job>> getAllPublicJobs(@PageableDefault(size = 10) Pageable pageable) {
        Page<Job> jobs = jobService.getAllPublicJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{jobId}")
    @Operation(summary = "Get public details for a specific active job by ID")
    public ResponseEntity<?> getPublicJobDetails(@PathVariable UUID jobId) {
        Optional<JobDetailResponse> jobDetails = jobService.getPublicJobDetails(jobId);
        return jobDetails.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search all active jobs with various criteria (paginated)")
    public ResponseEntity<Page<Job>> searchAllJobs(
        @Parameter(description = "Search query for title or description") @RequestParam(required = false) String query,
        @Parameter(description = "Location filter") @RequestParam(required = false) String location,
        @Parameter(description = "Job type filter") @RequestParam(required = false) String jobType,
        @Parameter(description = "Job status filter (e.g., OPEN, CLOSED)") @RequestParam(required = false) String status,
        @PageableDefault(size = 10) Pageable pageable) {
        Page<Job> jobs = jobService.searchAllJobs(query, location, jobType, status, pageable);
        return ResponseEntity.ok(jobs);
    }
} 