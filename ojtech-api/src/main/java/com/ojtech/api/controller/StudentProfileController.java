package com.ojtech.api.controller;

import com.ojtech.api.model.StudentProfile;
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
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/student-profiles")

@Tag(name = "Student Profiles", description = "Student profile management endpoints")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
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

    @PostMapping
    @Operation(
            summary = "Create a student profile",
            description = "Creates a new student profile"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Student profile created successfully",
            content = @Content(schema = @Schema(implementation = StudentProfile.class))
    )
    public ResponseEntity<StudentProfile> createStudentProfile(
            @Parameter(description = "Student profile to create", required = true)
            @Valid @RequestBody StudentProfile studentProfile) {
        StudentProfile createdProfile = studentProfileService.createStudentProfile(studentProfile);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
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