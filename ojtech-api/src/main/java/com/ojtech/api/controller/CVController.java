package com.ojtech.api.controller;

import com.ojtech.api.model.CV;
import com.ojtech.api.model.Profile;
import com.ojtech.api.security.UserDetailsImpl;
import com.ojtech.api.service.CVService;
import com.ojtech.api.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/cvs")
@Tag(name = "CV Management", description = "APIs for CV upload, parsing, and analysis")
public class CVController {

    private static final Logger log = LoggerFactory.getLogger(CVController.class);
    private final CVService cvService;
    private final ProfileService profileService;
    
    public CVController(CVService cvService, ProfileService profileService) {
        this.cvService = cvService;
        this.profileService = profileService;
    }

    /**
     * Get the current user's active CV
     */
    @GetMapping("/me")
    @Operation(
            summary = "Get current user's active CV",
            description = "Retrieves the active CV for the currently authenticated user"
    )
    @ApiResponse(
            responseCode = "200",
            description = "CV retrieved successfully",
            content = @Content(schema = @Schema(implementation = CV.class))
    )
    @ApiResponse(
            responseCode = "204",
            description = "User doesn't have any CV uploaded yet"
    )
    public ResponseEntity<CV> getCurrentUserCV(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = userDetails.getId();
        
        // Get the user profile
        Optional<Profile> profileOpt = profileService.getProfileById(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        Profile profile = profileOpt.get();
        
        // Check if the user has uploaded a CV
        if (Boolean.FALSE.equals(profile.getHasUploadedCv())) {
            return ResponseEntity.noContent().build();
        }
        
        // Get the active CVs for the user
        List<CV> activeCVs = cvService.getActiveCVsByUser(userId);
        
        if (activeCVs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        CV activeCV = activeCVs.get(0);
        
        return ResponseEntity.ok(activeCV);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload a CV",
            description = "Uploads and processes a student's CV/resume file"
    )
    @ApiResponse(
            responseCode = "202",
            description = "CV upload accepted for processing",
            content = @Content(schema = @Schema(implementation = CV.class))
    )
    public ResponseEntity<CV> uploadCV(
            @Parameter(description = "User ID", required = true)
            @RequestParam UUID userId,
            @Parameter(description = "CV/Resume file", required = true)
            @RequestParam("file") MultipartFile file) {
        
        CV cv = cvService.uploadCV(userId, file);
        return new ResponseEntity<>(cv, HttpStatus.ACCEPTED);
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Get CVs by user",
            description = "Retrieves all CVs associated with a user, optionally filtered by active status"
    )
    @ApiResponse(
            responseCode = "200",
            description = "CVs retrieved successfully",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = CV.class)))
    )
    public ResponseEntity<List<CV>> getCVsByUser(
            @Parameter(description = "User ID", required = true)
            @PathVariable UUID userId,
            @Parameter(description = "Filter for active CVs only")
            @RequestParam(required = false) Boolean activeOnly) {
        
        List<CV> cvs;
        if (Boolean.TRUE.equals(activeOnly)) {
            cvs = cvService.getActiveCVsByUser(userId);
        } else {
            cvs = cvService.getAllCVsByUser(userId);
        }
        
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get CV by ID",
            description = "Retrieves a specific CV by its ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "CV retrieved successfully",
            content = @Content(schema = @Schema(implementation = CV.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "CV not found"
    )
    public ResponseEntity<CV> getCVById(
            @Parameter(description = "CV ID", required = true)
            @PathVariable UUID id) {
        
        return cvService.getCVById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "Update CV processing status",
            description = "Updates the processing status of a CV (e.g., uploading, parsing, analyzing, complete, error)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Status updated successfully",
            content = @Content(schema = @Schema(implementation = CV.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "CV not found"
    )
    public ResponseEntity<CV> updateCVStatus(
            @Parameter(description = "CV ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Status update information", required = true)
            @RequestBody Map<String, String> statusUpdate) {
        
        String status = statusUpdate.get("status");
        String errorMessage = statusUpdate.get("errorMessage");
        
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        CV updatedCV = cvService.updateCVStatus(id, status, errorMessage);
        return ResponseEntity.ok(updatedCV);
    }

    @PatchMapping("/{id}/analysis")
    @Operation(
            summary = "Update CV analysis results",
            description = "Updates the AI analysis results for a CV"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Analysis results updated successfully",
            content = @Content(schema = @Schema(implementation = CV.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "CV not found"
    )
    public ResponseEntity<CV> updateCVAnalysis(
            @Parameter(description = "CV ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Analysis results", required = true)
            @RequestBody Map<String, Object> analysisData) {
        
        CV updatedCV = cvService.updateCVAnalysis(id, analysisData);
        return ResponseEntity.ok(updatedCV);
    }

    @PatchMapping("/{id}/set-active")
    @Operation(
            summary = "Set CV as active",
            description = "Sets a CV as the active one for a user (deactivating any other active CVs)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "CV set as active successfully",
            content = @Content(schema = @Schema(implementation = CV.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "CV not found"
    )
    public ResponseEntity<CV> setCVActive(
            @Parameter(description = "CV ID", required = true)
            @PathVariable UUID id) {
        
        CV activatedCV = cvService.setCVActive(id);
        return ResponseEntity.ok(activatedCV);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a CV",
            description = "Deletes a CV by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "CV deleted successfully"
    )
    public ResponseEntity<Void> deleteCV(
            @Parameter(description = "CV ID", required = true)
            @PathVariable UUID id) {
        
        cvService.deleteCV(id);
        return ResponseEntity.noContent().build();
    }
} 