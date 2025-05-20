package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.CloudinaryService;
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

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        // Check if user has a student profile
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUserId(userId);
        if (studentProfile.isPresent()) {
            return ResponseEntity.ok(studentProfile.get());
        }

        // Check if user has an employer profile
        Optional<EmployerProfile> employerProfile = employerProfileRepository.findByUserId(userId);
        if (employerProfile.isPresent()) {
            return ResponseEntity.ok(employerProfile.get());
        }

        // If no profile exists, return 404
        return ResponseEntity.notFound().build();
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

        // If no profile found with the given ID
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/avatar")
    @PreAuthorize("hasRole('STUDENT') or hasRole('EMPLOYER')")
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

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT') or hasRole('EMPLOYER')")
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