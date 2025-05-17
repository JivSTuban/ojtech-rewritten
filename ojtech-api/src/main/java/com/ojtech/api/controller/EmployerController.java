package com.ojtech.api.controller;

import com.ojtech.api.model.Employer;
import com.ojtech.api.service.EmployerService;
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
@RequestMapping("/api/employers")

@Tag(name = "Employers", description = "Employer management endpoints")
public class EmployerController {

    private final EmployerService employerService;

    @GetMapping
    @Operation(
            summary = "Get all employers",
            description = "Retrieves a list of all employers"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved employers",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Employer.class)))
    )
    public ResponseEntity<List<Employer>> getAllEmployers() {
        return ResponseEntity.ok(employerService.getAllEmployers());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get employer by ID",
            description = "Retrieves an employer by its UUID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved employer",
            content = @Content(schema = @Schema(implementation = Employer.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Employer not found"
    )
    public ResponseEntity<Employer> getEmployerById(
            @Parameter(description = "Employer ID", required = true)
            @PathVariable UUID id) {
        return employerService.getEmployerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/{profileId}")
    @Operation(
            summary = "Get employer by profile ID",
            description = "Retrieves an employer by the associated profile ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved employer",
            content = @Content(schema = @Schema(implementation = Employer.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Employer not found"
    )
    public ResponseEntity<Employer> getEmployerByProfileId(
            @Parameter(description = "Profile ID", required = true)
            @PathVariable UUID profileId) {
        return employerService.getEmployerByProfileId(profileId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/verified/{verified}")
    @Operation(
            summary = "Get employers by verification status",
            description = "Retrieves employers filtered by verification status"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved employers",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Employer.class)))
    )
    public ResponseEntity<List<Employer>> getEmployersByVerificationStatus(
            @Parameter(description = "Verification status", required = true)
            @PathVariable boolean verified) {
        return ResponseEntity.ok(employerService.getEmployersByVerificationStatus(verified));
    }

    @GetMapping("/industry/{industry}")
    @Operation(
            summary = "Get employers by industry",
            description = "Retrieves employers in a specific industry"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved employers",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Employer.class)))
    )
    public ResponseEntity<List<Employer>> getEmployersByIndustry(
            @Parameter(description = "Industry name", required = true)
            @PathVariable String industry) {
        return ResponseEntity.ok(employerService.getEmployersByIndustry(industry));
    }

    @PostMapping
    @Operation(
            summary = "Create an employer",
            description = "Creates a new employer profile"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Employer created successfully",
            content = @Content(schema = @Schema(implementation = Employer.class))
    )
    public ResponseEntity<Employer> createEmployer(
            @Parameter(description = "Employer to create", required = true)
            @Valid @RequestBody Employer employer) {
        Employer createdEmployer = employerService.createEmployer(employer);
        return new ResponseEntity<>(createdEmployer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update an employer",
            description = "Updates an existing employer profile"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Employer updated successfully",
            content = @Content(schema = @Schema(implementation = Employer.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Employer not found"
    )
    public ResponseEntity<Employer> updateEmployer(
            @Parameter(description = "Employer ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Updated employer details", required = true)
            @Valid @RequestBody Employer employer) {
        try {
            Employer updatedEmployer = employerService.updateEmployer(id, employer);
            return ResponseEntity.ok(updatedEmployer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/verify")
    @Operation(
            summary = "Verify an employer",
            description = "Updates the verification status of an employer"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Employer verification status updated successfully",
            content = @Content(schema = @Schema(implementation = Employer.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Employer not found"
    )
    public ResponseEntity<Employer> verifyEmployer(
            @Parameter(description = "Employer ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Verification status", required = true)
            @RequestParam boolean verified) {
        try {
            Employer verifiedEmployer = employerService.updateVerificationStatus(id, verified);
            return ResponseEntity.ok(verifiedEmployer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete an employer",
            description = "Deletes an employer by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Employer deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "Employer not found"
    )
    public ResponseEntity<Void> deleteEmployer(
            @Parameter(description = "Employer ID", required = true)
            @PathVariable UUID id) {
        try {
            employerService.deleteEmployer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 