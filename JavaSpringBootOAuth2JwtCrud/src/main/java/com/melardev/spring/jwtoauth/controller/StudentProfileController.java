package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.entities.UserRole;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/student-profiles")
public class StudentProfileController {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CVRepository cvRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getCurrentStudentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(profileOpt.get());
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createStudentProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if profile already exists
        Optional<StudentProfile> existingProfileOpt = studentProfileRepository.findByUserId(userId);
        if (existingProfileOpt.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Student profile already exists"));
        }

        // Create new profile
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setRole(UserRole.STUDENT);
        
        updateProfileFields(profile, profileData);
        
        profile = studentProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateStudentProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        updateProfileFields(profile, profileData);
        
        profile = studentProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        
        // Upload to Cloudinary
        Map<String, Object> result = cloudinaryService.upload(file, "cvs");
        String fileUrl = (String) result.get("url");
        
        // Create CV record
        CV cv = new CV();
        cv.setStudent(profile);
        cv.setFileName(file.getOriginalFilename());
        cv.setFileUrl(fileUrl);
        cv.setFileType(file.getContentType());
        cv.setUploadDate(LocalDateTime.now());
        cv = cvRepository.save(cv);
        
        // Set as active if no active CV exists
        if (profile.getActiveCvId() == null) {
            profile.setActiveCvId(cv.getId());
            studentProfileRepository.save(profile);
            cv.setActive(true);
            cvRepository.save(cv);
        }
        
        return ResponseEntity.ok(cv);
    }

    @GetMapping("/cvs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentCVs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        List<CV> cvs = cvRepository.findByStudent(profile);
        
        return ResponseEntity.ok(cvs);
    }

    @PutMapping("/cv/{cvId}/active")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> setActiveCV(@PathVariable UUID cvId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        
        // Check if CV exists and belongs to student
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty() || !cvOpt.get().getStudent().getId().equals(profile.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("CV not found or does not belong to you"));
        }
        
        // Reset active status on all CVs
        List<CV> cvs = cvRepository.findByStudent(profile);
        for (CV cv : cvs) {
            cv.setActive(false);
        }
        cvRepository.saveAll(cvs);
        
        // Set new active CV
        CV selectedCV = cvOpt.get();
        selectedCV.setActive(true);
        cvRepository.save(selectedCV);
        
        profile.setActiveCvId(cvId);
        studentProfileRepository.save(profile);
        
        return ResponseEntity.ok(new MessageResponse("Active CV updated successfully"));
    }

    private void updateProfileFields(StudentProfile profile, Map<String, Object> data) {
        if (data.containsKey("fullName")) {
            profile.setFullName((String) data.get("fullName"));
        }
        
        if (data.containsKey("firstName")) {
            profile.setFirstName((String) data.get("firstName"));
        }
        
        if (data.containsKey("lastName")) {
            profile.setLastName((String) data.get("lastName"));
        }
        
        if (data.containsKey("university")) {
            profile.setUniversity((String) data.get("university"));
        }
        
        if (data.containsKey("major")) {
            profile.setMajor((String) data.get("major"));
        }
        
        if (data.containsKey("graduationYear") && data.get("graduationYear") instanceof Number) {
            profile.setGraduationYear(((Number) data.get("graduationYear")).intValue());
        }
        
        if (data.containsKey("skills")) {
            profile.setSkills((String) data.get("skills"));
        }
        
        if (data.containsKey("githubUrl")) {
            profile.setGithubUrl((String) data.get("githubUrl"));
        }
        
        if (data.containsKey("linkedinUrl")) {
            profile.setLinkedinUrl((String) data.get("linkedinUrl"));
        }
        
        if (data.containsKey("portfolioUrl")) {
            profile.setPortfolioUrl((String) data.get("portfolioUrl"));
        }
        
        if (data.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) data.get("phoneNumber"));
        }
        
        if (data.containsKey("bio")) {
            profile.setBio((String) data.get("bio"));
        }
        
        if (data.containsKey("location")) {
            profile.setLocation((String) data.get("location"));
        }
        
        if (data.containsKey("hasCompletedOnboarding")) {
            profile.setHasCompletedOnboarding((Boolean) data.get("hasCompletedOnboarding"));
        }
    }
} 