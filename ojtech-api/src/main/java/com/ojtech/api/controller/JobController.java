package com.ojtech.api.controller;

import com.ojtech.api.model.Job;
import com.ojtech.api.payload.request.JobRequest;
import com.ojtech.api.payload.response.MessageResponse;
import com.ojtech.api.security.services.UserDetailsImpl;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs", description = "Job management and listing endpoints")
public class JobController {

    @Autowired
    private JobService jobService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null; // Or throw exception if user must be authenticated
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    // --- Employer Job Management Endpoints ---
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Create a new job posting", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> createJob(@Valid @RequestBody JobRequest jobRequest) {
        Long employerUserId = getCurrentUserId();
        if (employerUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not authenticated"));
        try {
            Job createdJob = jobService.createJob(jobRequest, employerUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating job: " + e.getMessage()));
        }
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Update an existing job posting", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> updateJob(@PathVariable Long jobId, @Valid @RequestBody JobRequest jobRequest) {
        Long employerUserId = getCurrentUserId();
        if (employerUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not authenticated"));
        try {
            Job updatedJob = jobService.updateJob(jobId, jobRequest, employerUserId);
            return ResponseEntity.ok(updatedJob);
        } catch (RuntimeException e) { // Catch more specific exceptions like AccessDeniedException if needed
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Delete a job posting", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteJob(@PathVariable Long jobId) {
        Long employerUserId = getCurrentUserId();
        if (employerUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not authenticated"));
        try {
            jobService.deleteJob(jobId, employerUserId);
            return ResponseEntity.ok(new MessageResponse("Job deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get jobs posted by the current employer", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getEmployerJobs(@PageableDefault(size = 10) Pageable pageable) {
        Long employerUserId = getCurrentUserId();
        if (employerUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not authenticated"));
        Page<Job> jobs = jobService.getJobsByEmployer(employerUserId, pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/my-jobs/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get a specific job by ID posted by current employer", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getEmployerJobById(@PathVariable Long jobId) {
        Long employerUserId = getCurrentUserId();
        if (employerUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not authenticated"));
        Optional<Job> job = jobService.getJobByIdAndEmployer(jobId, employerUserId);
        return job.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // --- Public Job Listing Endpoints ---
    @GetMapping
    @Operation(summary = "Get all active job postings (paginated)")
    public ResponseEntity<Page<Job>> getAllActiveJobs(@PageableDefault(size = 10) Pageable pageable) {
        Page<Job> jobs = jobService.getAllActiveJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{jobId}")
    @Operation(summary = "Get a specific active job by ID")
    public ResponseEntity<?> getActiveJobById(@PathVariable Long jobId) {
        Optional<Job> job = jobService.getActiveJobById(jobId);
        return job.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search active jobs by title (paginated)")
    public ResponseEntity<Page<Job>> searchJobsByTitle(
        @Parameter(description = "Search term for job title") @RequestParam String title,
        @PageableDefault(size = 10) Pageable pageable) {
        Page<Job> jobs = jobService.searchActiveJobsByTitle(title, pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/employer/{employerId}")
    @Operation(
            summary = "Get jobs by employer",
            description = "Retrieves all job postings by a specific employer"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved jobs",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Job.class)))
    )
    public ResponseEntity<List<Job>> getJobsByEmployer(
            @Parameter(description = "Employer profile ID", required = true)
            @PathVariable UUID employerId) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(employerId));
    }

    @GetMapping("/status/{status}")
    @Operation(
            summary = "Get jobs by status",
            description = "Retrieves jobs filtered by status (e.g., open, closed)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved jobs",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Job.class)))
    )
    public ResponseEntity<List<Job>> getJobsByStatus(
            @Parameter(description = "Job status", required = true)
            @PathVariable String status) {
        return ResponseEntity.ok(jobService.getJobsByStatus(status));
    }

    @GetMapping("/active")
    @Operation(
            summary = "Get active jobs",
            description = "Retrieves all active job postings (open and not past deadline)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved active jobs",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Job.class)))
    )
    public ResponseEntity<List<Job>> getActiveJobs() {
        return ResponseEntity.ok(jobService.getActiveJobs());
    }

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "Update job status",
            description = "Updates the status of a job posting (e.g., open, closed, filled)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Job status updated successfully",
            content = @Content(schema = @Schema(implementation = Job.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Job not found"
    )
    public ResponseEntity<Job> updateJobStatus(
            @Parameter(description = "Job ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "New status", required = true)
            @RequestParam String status) {
        try {
            Job updatedJob = jobService.updateJobStatus(id, status);
            return ResponseEntity.ok(updatedJob);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 