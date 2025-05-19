package com.ojtech.api.controller;

import com.ojtech.api.model.EmployerProfile;
import com.ojtech.api.model.Profile;
import com.ojtech.api.model.StudentProfile;
import com.ojtech.api.model.UserRole;
import com.ojtech.api.payload.request.EmployerOnboardingRequest;
import com.ojtech.api.payload.request.StudentOnboardingRequest;
import com.ojtech.api.payload.response.MessageResponse;
import com.ojtech.api.security.UserDetailsImpl;
import com.ojtech.api.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
@SecurityRequirement(name = "bearerAuth") // Indicates that JWT is required for these endpoints
@Tag(name = "Profiles", description = "Profile management endpoints")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    @Operation(
        summary = "Get all profiles",
        description = "Retrieves a list of all user profiles. Only accessible to admins."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successful operation",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = Profile.class))
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Profile>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @Operation(
        summary = "Get current user profile",
        description = "Retrieves the profile of the currently authenticated user"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successful operation",
            content = @Content(schema = @Schema(implementation = Profile.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized",
            content = @Content
        )
    })
    @GetMapping("/me")
    public ResponseEntity<Profile> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        
        // Debug the full Authentication object
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
                    log.debug("Principal type: {}, Name: {}, Authorities: {}", auth.getPrincipal().getClass().getName(), auth.getName(), auth.getAuthorities());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (userDetails == null) {
            
            // If we have authentication but no user details, try to get username from auth object
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                String username = auth.getName();
                return profileService.getProfileByEmail(username)
                    .map(profile -> {
                                log.debug("Found profile by email (auth.getName()): {}, Role: {}", profile.getEmail(), profile.getRole());
                        
                        // Return a sanitized profile to prevent issues with missing database tables
                        try {
                            // Ensure not to accidentally access any lazy-loaded entities
                            profile.setCvs(null);
                            return ResponseEntity.ok(profile);
                        } catch (Exception e) {
                            // Create a new profile object with just the essential data
                            Profile sanitizedProfile = new Profile();
                            sanitizedProfile.setId(profile.getId());
                            sanitizedProfile.setEmail(profile.getEmail());
                            sanitizedProfile.setFullName(profile.getFullName());
                            sanitizedProfile.setRole(profile.getRole());
                            sanitizedProfile.setHasCompletedOnboarding(profile.getHasCompletedOnboarding());
                            return ResponseEntity.ok(sanitizedProfile);
                        }
                    })
                    .orElseGet(() -> {
                        log.warn("Profile not found for user: {}", username);
                        return ResponseEntity.notFound().build();
                    });
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
                log.debug("UserDetails available. Username: {}, ID: {}", userDetails.getUsername(), userDetails.getId());
        
        UUID userId = userDetails.getId();
        if (userId == null) {
            
            // Try fallback to email lookup
            return profileService.getProfileByEmail(userDetails.getUsername())
                .map(profile -> {
                            log.debug("Found profile by email (userDetails.getUsername()): {}, Role: {}", profile.getEmail(), profile.getRole());
                    
                    // Return a sanitized profile to prevent issues with missing database tables
                    try {
                        // Ensure not to accidentally access any lazy-loaded entities
                        profile.setCvs(null);
                        return ResponseEntity.ok(profile);
                    } catch (Exception e) {
                        // Create a new profile object with just the essential data
                        Profile sanitizedProfile = new Profile();
                        sanitizedProfile.setId(profile.getId());
                        sanitizedProfile.setEmail(profile.getEmail());
                        sanitizedProfile.setFullName(profile.getFullName());
                        sanitizedProfile.setRole(profile.getRole());
                        sanitizedProfile.setHasCompletedOnboarding(profile.getHasCompletedOnboarding());
                        return ResponseEntity.ok(sanitizedProfile);
                    }
                })
                .orElseGet(() -> {
                            log.warn("Profile not found for email from userDetails: {}", userDetails.getUsername());
                    return ResponseEntity.notFound().build();
                });
        }
        
        try {
            return profileService.getProfileById(userId)
                    .map(profile -> {
                            log.debug("Successfully retrieved profile for userId: {}", userId);
                        
                        // Return a sanitized profile to prevent issues with missing database tables
                        try {
                            // Ensure not to accidentally access any lazy-loaded entities
                            profile.setCvs(null);
                            return ResponseEntity.ok(profile);
                        } catch (Exception e) {
                            // Create a new profile object with just the essential data
                            Profile sanitizedProfile = new Profile();
                            sanitizedProfile.setId(profile.getId());
                            sanitizedProfile.setEmail(profile.getEmail());
                            sanitizedProfile.setFullName(profile.getFullName());
                            sanitizedProfile.setRole(profile.getRole());
                            sanitizedProfile.setHasCompletedOnboarding(profile.getHasCompletedOnboarding());
                            return ResponseEntity.ok(sanitizedProfile);
                        }
                    })
                    .orElseGet(() -> {
                        log.warn("Profile not found for userId: {}", userId);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            // Catch any exceptions (like missing tables) that might occur during profile retrieval
            log.error("Error retrieving profile for userId {}: {}. Returning minimal profile from UserDetails.", userId, e.getMessage());
            
            // Create a minimal profile with data from UserDetails to allow authentication to succeed
            Profile minimalProfile = new Profile();
            minimalProfile.setId(userId);
            minimalProfile.setEmail(userDetails.getUsername());
            minimalProfile.setFullName(userDetails.getFullName());
            minimalProfile.setRole(UserRole.valueOf(userDetails.getRole()));
            
            return ResponseEntity.ok(minimalProfile);
        }
    }

    @Operation(
        summary = "Get profile by ID",
        description = "Retrieves a specific profile by its UUID. Admins can access any profile. Users can only access their own."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successful operation",
            content = @Content(schema = @Schema(implementation = Profile.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Profile not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @profileSecurityService.isProfileOwner(authentication, #id)")
    public ResponseEntity<Profile> getProfileById(
            @Parameter(description = "Profile UUID", required = true) 
            @PathVariable UUID id) {
        return profileService.getProfileById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Get profile by email",
        description = "Retrieves a specific profile by email address. Only accessible to admins."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successful operation",
            content = @Content(schema = @Schema(implementation = Profile.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Profile not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Profile> getProfileByEmail(
            @Parameter(description = "Email address", required = true) 
            @PathVariable String email) {
        return profileService.getProfileByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Get profiles by role",
        description = "Retrieves all profiles with a specific user role. Only accessible to admins."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successful operation",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = Profile.class))
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Profile>> getProfilesByRole(
            @Parameter(description = "User role (e.g., STUDENT, EMPLOYER, ADMIN)", required = true) 
            @PathVariable UserRole role) {
        return ResponseEntity.ok(profileService.getProfilesByRole(role));
    }

    @Operation(
        summary = "Create a new profile",
        description = "Creates a new user profile. Only accessible to admins. Regular users should use /api/auth/register."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Profile created successfully",
            content = @Content(schema = @Schema(implementation = Profile.class))
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Profile> createProfile(
            @Parameter(description = "Profile details", required = true) 
            @RequestBody Profile profile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.saveProfile(profile));
    }

    @Operation(
        summary = "Update a profile",
        description = "Updates an existing profile by ID. Admins can update any profile. Users can only update their own."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profile updated successfully",
            content = @Content(schema = @Schema(implementation = Profile.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Profile not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @profileSecurityService.isProfileOwner(authentication, #id)")
    public ResponseEntity<Profile> updateProfile(
            @Parameter(description = "Profile UUID", required = true) 
            @PathVariable UUID id, 
            @Parameter(description = "Updated profile details", required = true) 
            @RequestBody Profile profile) {
        try {
            Profile updatedProfile = profileService.updateProfile(id, profile);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Delete a profile",
        description = "Deletes a profile by ID. Only accessible to admins."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Profile deleted successfully",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Profile not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content
        )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProfile(
            @Parameter(description = "Profile UUID", required = true) 
            @PathVariable UUID id) {
        try {
            profileService.deleteProfile(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            log.warn("User is not authenticated or principal is null.");
            throw new AuthenticationException("User is not authenticated") {};
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            if (userDetails.getId() == null) {
                 log.error("Authenticated UserDetailsImpl has a null ID. Username: {}", userDetails.getUsername());
                 // Attempt to fetch profile by email as a fallback if ID is missing, though ID should always be present.
                 Profile p = profileService.getProfileByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User profile not found by email after ID was null: " + userDetails.getUsername()));
                 return p.getId(); // Return profile ID as a last resort.
            }
            return userDetails.getId(); // This is now UUID
        } else {
            log.error("Principal is not an instance of UserDetailsImpl. Actual type: {}", principal.getClass().getName());
            // Handle cases where principal might be a String (e.g. for anonymousUser or during some filter stages)
            if (principal instanceof String && !"anonymousUser".equals(principal)) {
                // This case should ideally not happen for protected endpoints if UserDetailsImpl is expected.
                // If it does, it indicates a potential issue in security configuration or UserDetailsService loading.
                log.warn("Principal is a String: {}. Attempting to find profile by this string as email/username.", principal);
                Profile p = profileService.getProfileByEmail((String) principal)
                    .orElseThrow(() -> new RuntimeException("User profile not found for principal string: " + principal));  
                return p.getUser().getId(); // Assuming Profile is linked to User and User has UUID id
            }
            throw new IllegalStateException("User principal is not of expected type UserDetailsImpl. Principal: " + principal.toString());
        }
    }

    // --- Student Profile Endpoints ---
    @PostMapping("/student/onboarding")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Complete student onboarding", description = "Allows a student to submit their profile details after registration.")
    public ResponseEntity<?> completeStudentOnboarding(@Valid @RequestBody StudentOnboardingRequest request) {
        try {
            UUID userId = getCurrentUserId();
            StudentProfile profile = profileService.completeStudentOnboarding(userId, request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error completing student onboarding: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error completing student onboarding: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/student/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload student CV", description = "Allows a student to upload their CV.")
    @ApiResponse(responseCode = "200", description = "CV uploaded successfully", content = @Content(schema = @Schema(implementation = StudentProfile.class)))
    @ApiResponse(responseCode = "400", description = "Bad request or upload failure")
    public ResponseEntity<?> uploadStudentCv(@Parameter(description = "CV file (PDF recommended)") @RequestParam("cvFile") MultipartFile cvFile) {
        if (cvFile.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("CV file is empty."));
        }
        try {
            UUID userId = getCurrentUserId();
            StudentProfile studentProfile = profileService.uploadStudentCv(userId, cvFile);
            Profile baseProfile = profileService.getProfileById(studentProfile.getProfile().getId())
                 .orElseThrow(() -> new RuntimeException("Failed to fetch updated profile after CV upload"));
            return ResponseEntity.ok(baseProfile);
        } catch (IOException e) {
            log.error("Failed to upload CV (IO Exception): {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Failed to upload CV: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading CV: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error uploading CV: " + e.getMessage()));
        }
    }

    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student profile", description = "Retrieves the profile of the currently authenticated student.")
    public ResponseEntity<?> getCurrentStudentProfile() {
        try {
            UUID userId = getCurrentUserId();
            Optional<StudentProfile> profileOpt = profileService.getStudentProfileByUserId(userId);
            if (profileOpt.isPresent()) {
                return ResponseEntity.ok(profileOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Student profile not found."));
            }
        } catch (Exception e) {
            log.error("Error fetching current student profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error fetching student profile: " + e.getMessage()));
        }
    }

    // --- Employer Profile Endpoints ---
    @PostMapping("/employer/onboarding")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Complete employer onboarding", description = "Allows an employer to submit their company profile details after registration.")
    public ResponseEntity<?> completeEmployerOnboarding(@Valid @RequestBody EmployerOnboardingRequest request) {
        try {
            UUID userId = getCurrentUserId();
            EmployerProfile profile = profileService.completeEmployerOnboarding(userId, request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error completing employer onboarding: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error completing employer onboarding: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/employer/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Upload employer company logo", description = "Allows an employer to upload their company logo.")
    @ApiResponse(responseCode = "200", description = "Logo uploaded successfully", content = @Content(schema = @Schema(implementation = EmployerProfile.class)))
    @ApiResponse(responseCode = "400", description = "Bad request or upload failure")
    public ResponseEntity<?> uploadEmployerLogo(@Parameter(description = "Company logo file (image)") @RequestParam("logoFile") MultipartFile logoFile) {
        if (logoFile.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Logo file is empty."));
        }
        try {
            UUID userId = getCurrentUserId();
            EmployerProfile employerProfile = profileService.uploadEmployerLogo(userId, logoFile);
            Profile baseProfile = profileService.getProfileById(employerProfile.getProfile().getId())
                 .orElseThrow(() -> new RuntimeException("Failed to fetch updated profile after logo upload"));
            return ResponseEntity.ok(baseProfile);
        } catch (IOException e) {
            log.error("Failed to upload logo (IO Exception): {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Failed to upload logo: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading logo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error uploading logo: " + e.getMessage()));
        }
    }

    @GetMapping("/employer/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Get current employer profile", description = "Retrieves the profile of the currently authenticated employer.")
    public ResponseEntity<?> getCurrentEmployerProfile() {
        try {
            UUID userId = getCurrentUserId();
            Optional<EmployerProfile> profileOpt = profileService.getEmployerProfileByUserId(userId);
            if (profileOpt.isPresent()) {
                return ResponseEntity.ok(profileOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Employer profile not found."));
            }
        } catch (Exception e) {
            log.error("Error fetching current employer profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error fetching employer profile: " + e.getMessage()));
        }
    }
} 