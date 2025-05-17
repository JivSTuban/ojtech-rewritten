package com.ojtech.api.controller;

import com.ojtech.api.model.Match;
import com.ojtech.api.service.JobMatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-matching")

@Tag(name = "Job Matching", description = "APIs for job matching functionality")
public class JobMatchingController {

    private final JobMatchingService jobMatchingService;

    @GetMapping("/student/{studentId}")
    @Operation(
            summary = "Get job matches for a student",
            description = "Retrieves all job matches for a specific student profile"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Matches retrieved successfully",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Match.class)))
    )
    public ResponseEntity<List<Match>> getMatchesForStudent(
            @Parameter(description = "Student ID", required = true)
            @PathVariable UUID studentId) {
        List<Match> matches = jobMatchingService.getMatchesForStudent(studentId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/job/{jobId}")
    @Operation(
            summary = "Get student matches for a job",
            description = "Retrieves all student matches for a specific job posting"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Matches retrieved successfully",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Match.class)))
    )
    public ResponseEntity<List<Match>> getMatchesForJob(
            @Parameter(description = "Job ID", required = true)
            @PathVariable UUID jobId) {
        List<Match> matches = jobMatchingService.getMatchesForJob(jobId);
        return ResponseEntity.ok(matches);
    }

    @PatchMapping("/{matchId}/status")
    @Operation(
            summary = "Update match status",
            description = "Updates the status of a job match (e.g., pending, accepted, rejected)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Match status updated successfully"
    )
    public ResponseEntity<Void> updateMatchStatus(
            @Parameter(description = "Match ID", required = true)
            @PathVariable UUID matchId,
            @Parameter(description = "New status", required = true)
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        jobMatchingService.updateMatchStatus(matchId, newStatus);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{matchId}")
    @Operation(
            summary = "Delete a match",
            description = "Deletes a job match by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Match deleted successfully"
    )
    public ResponseEntity<Void> deleteMatch(
            @Parameter(description = "Match ID", required = true)
            @PathVariable UUID matchId) {
        jobMatchingService.deleteMatch(matchId);
        return ResponseEntity.noContent().build();
    }
} 