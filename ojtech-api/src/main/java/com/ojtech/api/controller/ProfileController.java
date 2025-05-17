package com.ojtech.api.controller;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.UserRole;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")

@Tag(name = "Profiles", description = "Profile management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;
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
                    auth.getPrincipal().getClass().getName(), auth.getName(), auth.getAuthorities());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (userDetails == null) {
            
            // If we have authentication but no user details, try to get username from auth object
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                String username = auth.getName();
                return profileService.getProfileByEmail(username)
                    .map(profile -> {
                                profile.getEmail(), profile.getRole());
                        
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
                        return ResponseEntity.notFound().build();
                    });
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
                userDetails.getUsername(), userDetails.getId());
        
        UUID userId = userDetails.getId();
        if (userId == null) {
            
            // Try fallback to email lookup
            return profileService.getProfileByEmail(userDetails.getUsername())
                .map(profile -> {
                            profile.getEmail(), profile.getRole());
                    
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
                            userDetails.getUsername());
                    return ResponseEntity.notFound().build();
                });
        }
        
        try {
            return profileService.getProfileById(userId)
                    .map(profile -> {
                        
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
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            // Catch any exceptions (like missing tables) that might occur during profile retrieval
            
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
} 