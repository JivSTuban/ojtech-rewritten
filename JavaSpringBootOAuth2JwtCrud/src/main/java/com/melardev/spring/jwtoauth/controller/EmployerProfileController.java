package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.entities.UserRole;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/api/employer-profiles")
public class EmployerProfileController {

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> getCurrentEmployerProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> profileOpt = employerProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(profileOpt.get());
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> createEmployerProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if profile already exists
        Optional<EmployerProfile> existingProfileOpt = employerProfileRepository.findByUserId(userId);
        if (existingProfileOpt.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Employer profile already exists"));
        }

        // Create new profile
        EmployerProfile profile = new EmployerProfile();
        profile.setUser(user);
        profile.setRole(UserRole.EMPLOYER);
        
        updateProfileFields(profile, profileData);
        
        profile = employerProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateEmployerProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> profileOpt = employerProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        EmployerProfile profile = profileOpt.get();
        updateProfileFields(profile, profileData);
        
        profile = employerProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logo")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> profileOpt = employerProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        EmployerProfile profile = profileOpt.get();
        
        // Upload to Cloudinary
        Map<String, Object> result = cloudinaryService.upload(file, "logos");
        String logoUrl = (String) result.get("url");
        
        // Update profile
        profile.setLogoUrl(logoUrl);
        profile = employerProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    private void updateProfileFields(EmployerProfile profile, Map<String, Object> data) {
        if (data.containsKey("fullName")) {
            profile.setFullName((String) data.get("fullName"));
        }
        
        if (data.containsKey("companyName")) {
            profile.setCompanyName((String) data.get("companyName"));
        }
        
        if (data.containsKey("companySize")) {
            profile.setCompanySize((String) data.get("companySize"));
        }
        
        if (data.containsKey("industry")) {
            profile.setIndustry((String) data.get("industry"));
        }
        
        if (data.containsKey("location")) {
            profile.setLocation((String) data.get("location"));
        }
        
        if (data.containsKey("companyDescription")) {
            profile.setCompanyDescription((String) data.get("companyDescription"));
        }
        
        if (data.containsKey("websiteUrl")) {
            profile.setWebsiteUrl((String) data.get("websiteUrl"));
        }
        
        if (data.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) data.get("phoneNumber"));
        }
        
        if (data.containsKey("bio")) {
            profile.setBio((String) data.get("bio"));
        }
        
        if (data.containsKey("hasCompletedOnboarding")) {
            profile.setHasCompletedOnboarding((Boolean) data.get("hasCompletedOnboarding"));
        }
    }
} 