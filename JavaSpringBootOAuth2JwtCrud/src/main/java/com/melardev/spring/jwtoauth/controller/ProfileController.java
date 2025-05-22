package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.AdminProfileRepository;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.security.utils.SecurityUtils;
import com.melardev.spring.jwtoauth.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;
    
    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        logger.debug("GET /api/profiles/me called");
        
        // Get current user ID using SecurityUtils
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            logger.error("User ID is null - user not properly authenticated");
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }
        
        logger.debug("Extracted userId from token: {}", userId);

        // Check if user exists
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            logger.error("User with ID {} not found", userId);
            return ResponseEntity.status(404).body(new MessageResponse("User not found"));
        }
        
        User user = userOpt.get();
        logger.debug("Found user: {}", user.getUsername());

        // Check if user has a student profile
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUserId(userId);
        if (studentProfile.isPresent()) {
            logger.debug("Found student profile for user");
            return ResponseEntity.ok(studentProfile.get());
        }

        // Check if user has an employer profile
        Optional<EmployerProfile> employerProfile = employerProfileRepository.findByUserId(userId);
        if (employerProfile.isPresent()) {
            logger.debug("Found employer profile for user");
            return ResponseEntity.ok(employerProfile.get());
        }
        
        // Check if user has an admin profile
        Optional<AdminProfile> adminProfile = adminProfileRepository.findByUserId(userId);
        if (adminProfile.isPresent()) {
            logger.debug("Found admin profile for user");
            return ResponseEntity.ok(adminProfile.get());
        }

        // If no profile exists, return 404 with a helpful message
        logger.warn("No profile found for user ID: {}", userId);
        return ResponseEntity.status(404).body(new MessageResponse("No profile found. Please complete onboarding."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable UUID id) {
        // Check if it's a student profile
        Optional<StudentProfile> studentProfile = studentProfileRepository.findById(id);
        if (studentProfile.isPresent()) {
            return ResponseEntity.ok(studentProfile.get());
        }

        // Check if it's an employer profile
        Optional<EmployerProfile> employerProfile = employerProfileRepository.findById(id);
        if (employerProfile.isPresent()) {
            return ResponseEntity.ok(employerProfile.get());
        }
        
        // Check if it's an admin profile
        Optional<AdminProfile> adminProfile = adminProfileRepository.findById(id);
        if (adminProfile.isPresent()) {
            return ResponseEntity.ok(adminProfile.get());
        }

        // If no profile found with the given ID
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/employer/onboarding")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> completeEmployerOnboarding(@RequestBody Map<String, Object> profileData) {
        logger.debug("POST /api/profile/employer/onboarding called");
        
        // Get current user ID
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            logger.error("User ID is null - user not properly authenticated");
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }

        // Get the current user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        logger.debug("Found user: {}", user.getUsername());

        // Check if profile already exists
        Optional<EmployerProfile> existingProfileOpt = employerProfileRepository.findByUserId(userId);
        if (existingProfileOpt.isPresent()) {
            // Update existing profile
            EmployerProfile profile = existingProfileOpt.get();
            updateProfileFields(profile, profileData);
            profile.setHasCompletedOnboarding(true);
            profile = employerProfileRepository.save(profile);
            logger.debug("Updated existing employer profile");
            return ResponseEntity.ok(profile);
        }

        // Create new profile
        EmployerProfile profile = new EmployerProfile();
        profile.setUser(user);
        profile.setRole(UserRole.EMPLOYER);
        
        updateProfileFields(profile, profileData);
        profile.setHasCompletedOnboarding(true);
        
        profile = employerProfileRepository.save(profile);
        logger.debug("Created new employer profile");
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/avatar")
    @PreAuthorize("hasRole('STUDENT') or hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        // Upload file to Cloudinary
        Map result = cloudinaryService.upload(file, "avatars");
        String avatarUrl = (String) result.get("url");

        // Update the profile with the new avatar URL
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUserId(userId);
        if (studentProfile.isPresent()) {
            StudentProfile profile = studentProfile.get();
            profile.setAvatarUrl(avatarUrl);
            studentProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        Optional<EmployerProfile> employerProfile = employerProfileRepository.findByUserId(userId);
        if (employerProfile.isPresent()) {
            EmployerProfile profile = employerProfile.get();
            profile.setAvatarUrl(avatarUrl);
            employerProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }
        
        Optional<AdminProfile> adminProfile = adminProfileRepository.findByUserId(userId);
        if (adminProfile.isPresent()) {
            AdminProfile profile = adminProfile.get();
            profile.setAvatarUrl(avatarUrl);
            adminProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT') or hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        // Check if user has a student profile
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isPresent()) {
            StudentProfile profile = studentProfileOpt.get();
            updateProfileFields(profile, updates);
            studentProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        // Check if user has an employer profile
        Optional<EmployerProfile> employerProfileOpt = employerProfileRepository.findByUserId(userId);
        if (employerProfileOpt.isPresent()) {
            EmployerProfile profile = employerProfileOpt.get();
            updateProfileFields(profile, updates);
            employerProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }
        
        // Check if user has an admin profile
        Optional<AdminProfile> adminProfileOpt = adminProfileRepository.findByUserId(userId);
        if (adminProfileOpt.isPresent()) {
            AdminProfile profile = adminProfileOpt.get();
            updateProfileFields(profile, updates);
            adminProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
    }

    private void updateProfileFields(Profile profile, Map<String, Object> updates) {
        if (updates.containsKey("fullName")) {
            profile.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) updates.get("phoneNumber"));
        }
        if (updates.containsKey("bio")) {
            profile.setBio((String) updates.get("bio"));
        }
        if (updates.containsKey("location")) {
            profile.setLocation((String) updates.get("location"));
        }
        if (updates.containsKey("hasCompletedOnboarding")) {
            profile.setHasCompletedOnboarding((Boolean) updates.get("hasCompletedOnboarding"));
        }

        // Handle student-specific fields
        if (profile instanceof StudentProfile) {
            StudentProfile studentProfile = (StudentProfile) profile;
            if (updates.containsKey("firstName")) {
                studentProfile.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                studentProfile.setLastName((String) updates.get("lastName"));
            }
            if (updates.containsKey("university")) {
                studentProfile.setUniversity((String) updates.get("university"));
            }
            if (updates.containsKey("major")) {
                studentProfile.setMajor((String) updates.get("major"));
            }
            if (updates.containsKey("graduationYear")) {
                studentProfile.setGraduationYear((Integer) updates.get("graduationYear"));
            }
            if (updates.containsKey("skills")) {
                studentProfile.setSkills((String) updates.get("skills"));
            }
            if (updates.containsKey("githubUrl")) {
                studentProfile.setGithubUrl((String) updates.get("githubUrl"));
            }
            if (updates.containsKey("linkedinUrl")) {
                studentProfile.setLinkedinUrl((String) updates.get("linkedinUrl"));
            }
            if (updates.containsKey("portfolioUrl")) {
                studentProfile.setPortfolioUrl((String) updates.get("portfolioUrl"));
            }
        }

        // Handle employer-specific fields
        if (profile instanceof EmployerProfile) {
            EmployerProfile employerProfile = (EmployerProfile) profile;
            if (updates.containsKey("companyName")) {
                employerProfile.setCompanyName((String) updates.get("companyName"));
            }
            if (updates.containsKey("companySize")) {
                employerProfile.setCompanySize((String) updates.get("companySize"));
            }
            if (updates.containsKey("industry")) {
                employerProfile.setIndustry((String) updates.get("industry"));
            }
            if (updates.containsKey("companyDescription")) {
                employerProfile.setCompanyDescription((String) updates.get("companyDescription"));
            }
            if (updates.containsKey("websiteUrl")) {
                employerProfile.setWebsiteUrl((String) updates.get("websiteUrl"));
            }
            if (updates.containsKey("logoUrl")) {
                employerProfile.setLogoUrl((String) updates.get("logoUrl"));
            }
        }
    }
} 