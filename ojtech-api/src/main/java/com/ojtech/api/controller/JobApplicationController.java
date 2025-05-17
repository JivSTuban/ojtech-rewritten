package com.ojtech.api.controller;

import com.ojtech.api.model.JobApplication;
import com.ojtech.api.service.JobApplicationService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-applications")

@Tag(name = "Job Applications", description = "APIs for managing job applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping
    @Operation(
            summary = "Submit a job application",
            description = "Creates a new job application for a student"
    )
    @ApiResponse(
            responseCode = "201", 
            description = "Application submitted successfully",
            content = @Content(schema = @Schema(implementation = JobApplication.class))
    )
    public ResponseEntity<JobApplication> createJobApplication(
            @Valid @RequestBody JobApplication jobApplication) {
        JobApplication createdApplication = jobApplicationService.createJobApplication(jobApplication);
        return new ResponseEntity<>(createdApplication, HttpStatus.CREATED);
    }

    @GetMapping("/student/{studentId}")
    @Operation(
            summary = "Get applications by student",
            description = "Retrieves all job applications submitted by a specific student"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Applications retrieved successfully",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = JobApplication.class)))
    )
    public ResponseEntity<List<JobApplication>> getApplicationsByStudent(
            @Parameter(description = "Student ID", required = true)
            @PathVariable UUID studentId) {
        List<JobApplication> applications = jobApplicationService.getApplicationsByStudent(studentId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/job/{jobId}")
    @Operation(
            summary = "Get applications for a job",
            description = "Retrieves all applications for a specific job posting"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Applications retrieved successfully",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = JobApplication.class)))
    )
    public ResponseEntity<List<JobApplication>> getApplicationsByJob(
            @Parameter(description = "Job ID", required = true)
            @PathVariable UUID jobId) {
        List<JobApplication> applications = jobApplicationService.getApplicationsByJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get application by ID",
            description = "Retrieves a job application by its ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Application retrieved successfully",
            content = @Content(schema = @Schema(implementation = JobApplication.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Application not found"
    )
    public ResponseEntity<JobApplication> getApplicationById(
            @Parameter(description = "Application ID", required = true)
            @PathVariable UUID id) {
        return jobApplicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "Update application status",
            description = "Updates the status of a job application (e.g., pending, reviewed, shortlisted, rejected, hired)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Application status updated successfully",
            content = @Content(schema = @Schema(implementation = JobApplication.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Application not found"
    )
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @Parameter(description = "Application ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "New status", required = true)
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return jobApplicationService.updateApplicationStatus(id, newStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/notes")
    @Operation(
            summary = "Update employer notes",
            description = "Updates the employer notes for a job application"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Notes updated successfully",
            content = @Content(schema = @Schema(implementation = JobApplication.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Application not found"
    )
    public ResponseEntity<JobApplication> updateEmployerNotes(
            @Parameter(description = "Application ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Employer notes", required = true)
            @RequestBody Map<String, String> notesUpdate) {
        
        String notes = notesUpdate.get("notes");
        if (notes == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return jobApplicationService.updateEmployerNotes(id, notes)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete an application",
            description = "Deletes a job application by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Application deleted successfully"
    )
    public ResponseEntity<Void> deleteApplication(
            @Parameter(description = "Application ID", required = true)
            @PathVariable UUID id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
} 