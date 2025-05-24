package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.Certification;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.WorkExperience;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.CertificationRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.WorkExperienceRepository;
import com.melardev.spring.jwtoauth.security.CurrentUser;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/cvs")
public class CVController {

    private final CVRepository cvRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CertificationRepository certificationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final GeminiService geminiService;

    @Autowired
    public CVController(CVRepository cvRepository, 
                        StudentProfileRepository studentProfileRepository,
                        CertificationRepository certificationRepository,
                        WorkExperienceRepository workExperienceRepository,
                        GeminiService geminiService) {
        this.cvRepository = cvRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.certificationRepository = certificationRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.geminiService = geminiService;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CV>> getAllCVs(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        List<CV> cvs = cvRepository.findByStudent(studentOpt.get());
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> getCVById(@PathVariable UUID id, @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return ResponseEntity.ok(cv);
    }

    /**
     * Generate a CV based on student profile data
     * This creates a placeholder CV entity that will be updated with the actual CV data later
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> generateCV(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        StudentProfile student = studentOpt.get();
        
        // Create a CV entity that will store the AI-generated resume
        CV cv = new CV();
        cv.setStudent(student);
        cv.setActive(true);
        cv.setGenerated(true);
        cv.setLastUpdated(LocalDateTime.now());
        
        // Save CV
        CV savedCV = cvRepository.save(cv);
        
        // If setting to active, deactivate all other CVs for this student
        List<CV> activeCVs = cvRepository.findByStudentAndActive(student, true);
        for (CV activeCV : activeCVs) {
            if (!activeCV.getId().equals(savedCV.getId())) {
                activeCV.setActive(false);
                cvRepository.save(activeCV);
            }
        }
        
        // Update student's activeCvId
        student.setActiveCvId(savedCV.getId());
        studentProfileRepository.save(student);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCV);
    }
    
    /**
     * Update a CV with the AI-generated HTML content
     */
    @PutMapping("/{id}/content")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> updateCVContent(
            @PathVariable UUID id,
            @RequestBody String htmlContent,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this CV");
        }
        
        // Store the HTML content in the parsedResume field
        cv.setParsedResume(htmlContent);
        cv.setLastUpdated(LocalDateTime.now());
        
        CV updatedCV = cvRepository.save(cv);
        return ResponseEntity.ok(updatedCV);
    }
    
    /**
     * Get the HTML content of a CV
     */
    @GetMapping("/{id}/content")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getCVContent(@PathVariable UUID id, @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        if (cv.getParsedResume() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV content not found");
        }
        
        return ResponseEntity.ok(cv.getParsedResume());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteCV(@PathVariable UUID id, @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to delete this CV");
        }
        
        // If this was the active CV, update student's activeCvId
        if (cv.isActive()) {
            StudentProfile student = cv.getStudent();
            student.setActiveCvId(null);
            studentProfileRepository.save(student);
        }
        
        cvRepository.delete(cv);
        return ResponseEntity.noContent().build();
    }
    
    // Certification endpoints
    
    @GetMapping("/{cvId}/certifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Set<Certification>> getCertifications(@PathVariable UUID cvId, 
                                                              @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return ResponseEntity.ok(cv.getCertifications());
    }
    
    @PostMapping("/{cvId}/certifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Certification> addCertification(
            @PathVariable UUID cvId,
            @RequestParam String name,
            @RequestParam String issuer,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateReceived,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(required = false) String credentialUrl,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Certification certification = new Certification();
        certification.setName(name);
        certification.setIssuer(issuer);
        certification.setDateReceived(dateReceived);
        certification.setExpiryDate(expiryDate);
        certification.setCredentialUrl(credentialUrl);
        certification.setCv(cv);
        certification.setStudent(cv.getStudent());
        
        Certification savedCertification = certificationRepository.save(certification);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCertification);
    }
    
    @PutMapping("/{cvId}/certifications/{certId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Certification> updateCertification(
            @PathVariable UUID cvId,
            @PathVariable UUID certId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String issuer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateReceived,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(required = false) String credentialUrl,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<Certification> certOpt = certificationRepository.findById(certId);
        if (certOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found");
        }
        
        Certification certification = certOpt.get();
        if (!certification.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certification does not belong to the specified CV");
        }
        
        if (name != null) {
            certification.setName(name);
        }
        
        if (issuer != null) {
            certification.setIssuer(issuer);
        }
        
        if (dateReceived != null) {
            certification.setDateReceived(dateReceived);
        }
        
        certification.setExpiryDate(expiryDate); // Can be null
        certification.setCredentialUrl(credentialUrl); // Can be null
        
        Certification updatedCertification = certificationRepository.save(certification);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.ok(updatedCertification);
    }
    
    @DeleteMapping("/{cvId}/certifications/{certId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable UUID cvId,
            @PathVariable UUID certId,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<Certification> certOpt = certificationRepository.findById(certId);
        if (certOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found");
        }
        
        Certification certification = certOpt.get();
        if (!certification.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certification does not belong to the specified CV");
        }
        
        certificationRepository.delete(certification);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.noContent().build();
    }
    
    // Work Experience endpoints
    
    @GetMapping("/{cvId}/experiences")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Set<WorkExperience>> getExperiences(@PathVariable UUID cvId, 
                                                           @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return ResponseEntity.ok(cv.getExperiences());
    }
    
    @PostMapping("/{cvId}/experiences")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WorkExperience> addExperience(
            @PathVariable UUID cvId,
            @RequestParam String title,
            @RequestParam String company,
            @RequestParam(required = false) String location,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "false") boolean current,
            @RequestParam String description,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        // Validate that if current is true, endDate should be null
        if (current && endDate != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date should not be provided for current positions");
        }
        
        // Validate that if current is false, endDate is required
        if (!current && endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date is required for non-current positions");
        }
        
        WorkExperience experience = new WorkExperience();
        experience.setTitle(title);
        experience.setCompany(company);
        experience.setLocation(location);
        experience.setStartDate(startDate);
        experience.setEndDate(endDate);
        experience.setCurrent(current);
        experience.setDescription(description);
        experience.setCv(cv);
        experience.setStudent(cv.getStudent());
        
        WorkExperience savedExperience = workExperienceRepository.save(experience);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExperience);
    }
    
    @PutMapping("/{cvId}/experiences/{expId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WorkExperience> updateExperience(
            @PathVariable UUID cvId,
            @PathVariable UUID expId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Boolean current,
            @RequestParam(required = false) String description,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<WorkExperience> expOpt = workExperienceRepository.findById(expId);
        if (expOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work experience not found");
        }
        
        WorkExperience experience = expOpt.get();
        if (!experience.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Work experience does not belong to the specified CV");
        }
        
        // Update fields if provided
        if (title != null) {
            experience.setTitle(title);
        }
        
        if (company != null) {
            experience.setCompany(company);
        }
        
        experience.setLocation(location); // Can be null
        
        if (startDate != null) {
            experience.setStartDate(startDate);
        }
        
        // Handle current and endDate logic
        if (current != null) {
            experience.setCurrent(current);
            if (current) {
                experience.setEndDate(null);
            }
        }
        
        if (endDate != null) {
            if (experience.isCurrent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date should not be provided for current positions");
            }
            experience.setEndDate(endDate);
        }
        
        if (description != null) {
            experience.setDescription(description);
        }
        
        WorkExperience updatedExperience = workExperienceRepository.save(experience);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.ok(updatedExperience);
    }
    
    @DeleteMapping("/{cvId}/experiences/{expId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable UUID cvId,
            @PathVariable UUID expId,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<WorkExperience> expOpt = workExperienceRepository.findById(expId);
        if (expOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work experience not found");
        }
        
        WorkExperience experience = expOpt.get();
        if (!experience.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Work experience does not belong to the specified CV");
        }
        
        workExperienceRepository.delete(experience);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CV>> getCurrentUserCVs(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<CV> cvs = cvRepository.findByStudent(studentOpt.get());
        return ResponseEntity.ok(cvs);
    }
    
    /**
     * Get the HTML content of the current user's active CV
     */
    @GetMapping("/me/content")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getCurrentUserCVContent(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        StudentProfile student = studentOpt.get();
        if (student.getActiveCvId() == null) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<CV> cvOpt = cvRepository.findById(student.getActiveCvId());
        if (cvOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        CV cv = cvOpt.get();
        if (cv.getParsedResume() == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(cv.getParsedResume());
    }

    @PostMapping({"/cv/generate", "/cvs/generate"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> generateCVFromData(@RequestBody Map<String, Object> profileData, @CurrentUser UserDetailsImpl currentUser) {
        try {
            // Log user information for debugging
            System.out.println("CV Generation request from user: " + currentUser.getUsername());
            System.out.println("User roles: " + currentUser.getAuthorities());
            System.out.println("CV Controller - Profile data keys: " + profileData.keySet());
            
            // Log some key profile data fields
            System.out.println("CV Controller - First name: " + profileData.getOrDefault("firstName", "not provided"));
            System.out.println("CV Controller - Last name: " + profileData.getOrDefault("lastName", "not provided"));
            System.out.println("CV Controller - Email: " + profileData.getOrDefault("email", "not provided"));
            
            // Check if skills is present and is a list
            Object skills = profileData.get("skills");
            if (skills != null && skills instanceof List) {
                System.out.println("CV Controller - Skills count: " + ((List<?>) skills).size());
            } else {
                System.out.println("CV Controller - Skills is null or not a list: " + skills);
            }
            
            // Prepare input data for AI service
            Map<String, Object> cvData = new HashMap<>();
            
            // Personal information
            cvData.put("firstName", profileData.getOrDefault("firstName", ""));
            cvData.put("lastName", profileData.getOrDefault("lastName", ""));
            cvData.put("email", profileData.getOrDefault("email", ""));
            cvData.put("phoneNumber", profileData.getOrDefault("phoneNumber", ""));
            cvData.put("location", profileData.getOrDefault("location", ""));
            cvData.put("address", profileData.getOrDefault("address", ""));
            
            // Education
            cvData.put("university", profileData.getOrDefault("university", ""));
            cvData.put("major", profileData.getOrDefault("major", ""));
            cvData.put("graduationYear", profileData.getOrDefault("graduationYear", ""));
            
            // Professional information
            cvData.put("skills", profileData.getOrDefault("skills", new ArrayList<>()));
            cvData.put("experiences", profileData.getOrDefault("experiences", new ArrayList<>()));
            cvData.put("certifications", profileData.getOrDefault("certifications", new ArrayList<>()));
            cvData.put("githubProjects", profileData.getOrDefault("githubProjects", new ArrayList<>()));
            cvData.put("bio", profileData.getOrDefault("bio", ""));
            
            // Online presence
            cvData.put("githubUrl", profileData.getOrDefault("githubUrl", ""));
            cvData.put("linkedinUrl", profileData.getOrDefault("linkedinUrl", ""));
            cvData.put("portfolioUrl", profileData.getOrDefault("portfolioUrl", ""));
            
            System.out.println("CV Controller - Calling geminiService.generateResumeContent");
            String resumeContent = geminiService.generateResumeContent(cvData);
            System.out.println("CV Controller - Resume content generated successfully, length: " + 
                              (resumeContent != null ? resumeContent.length() : "null"));
            
            // Log more details about the response content
            if (resumeContent != null) {
                System.out.println("CV Controller - Response content preview: " + 
                    (resumeContent.length() > 200 ? resumeContent.substring(0, 200) + "..." : resumeContent));
                
                // Determine if response is JSON
                boolean isJson = resumeContent.trim().startsWith("{") && resumeContent.trim().endsWith("}");
                System.out.println("CV Controller - Response appears to be JSON: " + isJson);
                
                // Check if contains HTML
                boolean containsHtml = resumeContent.contains("<html>") || resumeContent.contains("<!DOCTYPE");
                System.out.println("CV Controller - Response contains HTML: " + containsHtml);
                
                // Count the number of JSON fields (if it's JSON)
                if (isJson) {
                    long fieldCount = resumeContent.chars().filter(ch -> ch == ':').count();
                    System.out.println("CV Controller - Approximate number of JSON fields: " + fieldCount);
                }
            } else {
                System.out.println("CV Controller - WARNING: Null response received from geminiService");
            }
            
            return ResponseEntity.ok(resumeContent);
        } catch (Exception e) {
            System.out.println("CV Controller - Error generating CV: " + e.getClass().getName() + ": " + e.getMessage());
            
            // Log the stack trace
            System.out.println("CV Controller - Error stack trace:");
            e.printStackTrace();
            
            // Log more details about specific error types
            if (e instanceof org.springframework.web.client.RestClientException) {
                System.out.println("CV Controller - RestClientException detected - likely an issue with the AI service connection");
                
                // Check for connection timeouts
                if (e.getMessage() != null && e.getMessage().contains("timed out")) {
                    System.out.println("CV Controller - Connection timeout detected - check AI service availability");
                    return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                        .body("Failed to generate CV: Connection to AI service timed out. Please try again later.");
                }
                
                // Check for connection refusal
                if (e.getMessage() != null && e.getMessage().contains("refused")) {
                    System.out.println("CV Controller - Connection refused - check AI service endpoint configuration");
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("Failed to generate CV: Connection to AI service refused. Please check server configuration.");
                }
            } else if (e instanceof com.fasterxml.jackson.core.JsonProcessingException) {
                System.out.println("CV Controller - JSON processing error - likely malformed response from AI service");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate CV: Error processing AI response. Please try again.");
            } else if (e instanceof IllegalArgumentException) {
                System.out.println("CV Controller - Invalid argument - check input data");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to generate CV: " + e.getMessage());
            }
            
            return ResponseEntity.badRequest().body("Failed to generate CV: " + e.getMessage());
        }
    }
} 