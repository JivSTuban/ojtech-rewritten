package com.ojtech.api.controller;

import com.ojtech.api.model.StudentProfile;
import com.ojtech.api.model.Profile;
import com.ojtech.api.payload.response.MessageResponse;
import com.ojtech.api.repository.ProfileRepository;
import com.ojtech.api.service.StudentProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/profile/student")
@Tag(name = "Student Profile", description = "Student profile management APIs")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    private final ProfileRepository profileRepository;
    private static final Logger log = LoggerFactory.getLogger(StudentProfileController.class);

    public StudentProfileController(StudentProfileService studentProfileService, ProfileRepository profileRepository) {
        this.studentProfileService = studentProfileService;
        this.profileRepository = profileRepository;
    }

    @GetMapping
    @Operation(
            summary = "Get all student profiles",
            description = "Retrieves a list of all student profiles"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved student profiles",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = StudentProfile.class)))
    )
    public ResponseEntity<List<StudentProfile>> getAllStudentProfiles() {
        return ResponseEntity.ok(studentProfileService.getAllStudentProfiles());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get student profile by ID",
            description = "Retrieves a student profile by its UUID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved student profile",
            content = @Content(schema = @Schema(implementation = StudentProfile.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Student profile not found"
    )
    public ResponseEntity<StudentProfile> getStudentProfileById(
            @Parameter(description = "Student profile ID", required = true)
            @PathVariable UUID id) {
        return studentProfileService.getStudentProfileById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/{profileId}")
    @Operation(
            summary = "Get student profile by profile ID",
            description = "Retrieves a student profile by the associated profile ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved student profile",
            content = @Content(schema = @Schema(implementation = StudentProfile.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Student profile not found"
    )
    public ResponseEntity<StudentProfile> getStudentProfileByProfileId(
            @Parameter(description = "Profile ID", required = true)
            @PathVariable UUID profileId) {
        return studentProfileService.getStudentProfileByProfileId(profileId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/onboarding-v2")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Complete student onboarding",
            description = "Creates or updates a student profile with onboarding information"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Student profile created/updated successfully",
            content = @Content(schema = @Schema(implementation = StudentProfile.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Invalid request or profile not found"
    )
    public ResponseEntity<?> createStudentProfile(
            @RequestBody StudentProfile studentProfileRequest,
            Authentication authentication) {
        
        log.info("Student onboarding request received from: {}", authentication.getName());
        
        try {
            // Find the profile for the current user
            Optional<Profile> profileOpt = profileRepository.findByEmail(authentication.getName());
            
            if (profileOpt.isEmpty()) {
                log.error("Profile not found for user: {}", authentication.getName());
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error completing student onboarding: Profile not found"));
            }
            
            Profile profile = profileOpt.get();
            log.info("Found profile with ID: {} for email: {}", profile.getId(), profile.getEmail());
            
            // Check if student profile already exists
            Optional<StudentProfile> existingStudentProfile = studentProfileService.getStudentProfileByProfileId(profile.getId());
            
            StudentProfile studentProfile;
            if (existingStudentProfile.isPresent()) {
                // Update existing student profile
                studentProfile = existingStudentProfile.get();
                log.info("Updating existing student profile with ID: {}", studentProfile.getId());
            } else {
                // Create new student profile
                studentProfile = new StudentProfile();
                studentProfile.setProfile(profile);
                log.info("Creating new student profile for profile ID: {}", profile.getId());
            }
            
            // Update student profile fields from request
            // Get the full name from the profile and update it
            String fullName = studentProfileRequest.getProfile() != null ? 
                studentProfileRequest.getProfile().getFullName() : profile.getFullName();
            profile.setFullName(fullName);
            
            studentProfile.setUniversity(studentProfileRequest.getUniversity());
            studentProfile.setCourse(studentProfileRequest.getCourse());
            studentProfile.setYearLevel(studentProfileRequest.getYearLevel());
            studentProfile.setBio(studentProfileRequest.getBio());
            studentProfile.setGithubProfile(studentProfileRequest.getGithubProfile());
            
            // Mark onboarding as completed
            profile.setHasCompletedOnboarding(true);
            profileRepository.save(profile);
            
            // Save student profile
            StudentProfile savedStudentProfile = studentProfileService.createStudentProfile(studentProfile);
            log.info("Student profile saved successfully with ID: {}", savedStudentProfile.getId());
            
            return ResponseEntity.ok(savedStudentProfile);
        } catch (Exception e) {
            log.error("Error completing student onboarding: {}", e.getMessage(), e);
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error completing student onboarding: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update a student profile",
            description = "Updates an existing student profile"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Student profile updated successfully",
            content = @Content(schema = @Schema(implementation = StudentProfile.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Student profile not found"
    )
    public ResponseEntity<StudentProfile> updateStudentProfile(
            @Parameter(description = "Student profile ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Updated student profile", required = true)
            @Valid @RequestBody StudentProfile studentProfile) {
        try {
            StudentProfile updatedProfile = studentProfileService.updateStudentProfile(id, studentProfile);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a student profile",
            description = "Deletes a student profile by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Student profile deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "Student profile not found"
    )
    public ResponseEntity<Void> deleteStudentProfile(
            @Parameter(description = "Student profile ID", required = true)
            @PathVariable UUID id) {
        try {
            studentProfileService.deleteStudentProfile(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 