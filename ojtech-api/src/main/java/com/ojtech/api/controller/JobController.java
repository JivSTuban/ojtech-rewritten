package com.ojtech.api.controller;

import com.ojtech.api.model.Job;
import com.ojtech.api.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")

@Tag(name = "Jobs", description = "Job posting management endpoints")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(
            summary = "Get all jobs",
            description = "Retrieves a list of all job postings"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved jobs",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Job.class)))
    )
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get job by ID",
            description = "Retrieves a job posting by its UUID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved job",
            content = @Content(schema = @Schema(implementation = Job.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Job not found"
    )
    public ResponseEntity<Job> getJobById(
            @Parameter(description = "Job ID", required = true)
            @PathVariable UUID id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

    @GetMapping("/search")
    @Operation(
            summary = "Search jobs",
            description = "Searches jobs by title, description, or other criteria"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved jobs",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Job.class)))
    )
    public ResponseEntity<List<Job>> searchJobs(
            @Parameter(description = "Search query")
            @RequestParam(required = false) String query,
            @Parameter(description = "Location filter")
            @RequestParam(required = false) String location,
            @Parameter(description = "Job type filter")
            @RequestParam(required = false) String jobType) {
        
        List<Job> jobs;
        if (query != null && !query.isEmpty()) {
            jobs = jobService.searchJobs(query);
        } else if (location != null && !location.isEmpty()) {
            jobs = jobService.getJobsByLocation(location);
        } else if (jobType != null && !jobType.isEmpty()) {
            jobs = jobService.getJobsByJobType(jobType);
        } else {
            jobs = jobService.getActiveJobs();
        }
        
        return ResponseEntity.ok(jobs);
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

    @PostMapping
    @Operation(
            summary = "Create a job posting",
            description = "Creates a new job posting"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Job created successfully",
            content = @Content(schema = @Schema(implementation = Job.class))
    )
    public ResponseEntity<Job> createJob(
            @Parameter(description = "Job to create", required = true)
            @Valid @RequestBody Job job) {
        Job createdJob = jobService.createJob(job);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update a job posting",
            description = "Updates an existing job posting"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Job updated successfully",
            content = @Content(schema = @Schema(implementation = Job.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Job not found"
    )
    public ResponseEntity<Job> updateJob(
            @Parameter(description = "Job ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Updated job details", required = true)
            @Valid @RequestBody Job job) {
        try {
            Job updatedJob = jobService.updateJob(id, job);
            return ResponseEntity.ok(updatedJob);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a job posting",
            description = "Deletes a job posting by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Job deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "Job not found"
    )
    public ResponseEntity<Void> deleteJob(
            @Parameter(description = "Job ID", required = true)
            @PathVariable UUID id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 