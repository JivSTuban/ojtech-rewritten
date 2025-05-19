package com.ojtech.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.CV;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.CVRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.security.MessageDigest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class CVServiceImpl implements CVService {

    private final CVRepository cvRepository;
    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;
    private final JobMatchingService jobMatchingService;
    
    public CVServiceImpl(CVRepository cvRepository, 
                        ProfileRepository profileRepository,
                        ObjectMapper objectMapper,
                        JobMatchingService jobMatchingService) {
        this.cvRepository = cvRepository;
        this.profileRepository = profileRepository;
        this.objectMapper = objectMapper;
        this.jobMatchingService = jobMatchingService;
    }

    @Override
    public CV uploadCV(UUID userId, MultipartFile file) {
        try {
            
            Profile user = profileRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // Calculate file hash
            String fileHash = calculateFileHash(file);
            
            // Get next version
            Integer nextVersion = cvRepository.findMaxVersionByUser(user);
            if (nextVersion == null) {
                nextVersion = 1;
            } else {
                nextVersion += 1;
            }
            
            // Create new CV
            CV cv = CV.builder()
                    .user(user)
                    .status("uploading")
                    .version(nextVersion)
                    .isActive(true)
                    .fileHash(fileHash)
                    .build();
            
            CV savedCV = cvRepository.save(cv);
            
            // Update user profile
            user.setHasUploadedCv(true);
            user.setCvProcessingStatus("uploading");
            profileRepository.save(user);
            
            
            // In a real implementation, this would trigger an async process to parse the file
            // For now, we'll just return the saved CV
            return savedCV;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload CV", e);
        }
    }

    @Override
    public Optional<CV> getCVById(UUID id) {
        return cvRepository.findById(id);
    }

    @Override
    public List<CV> getAllCVsByUser(UUID userId) {
        Optional<Profile> user = profileRepository.findById(userId);
        if (user.isEmpty()) {
            return Collections.emptyList();
        }
        
        return cvRepository.findByUser(user.get());
    }

    @Override
    public List<CV> getActiveCVsByUser(UUID userId) {
        Optional<Profile> user = profileRepository.findById(userId);
        if (user.isEmpty()) {
            return Collections.emptyList();
        }
        
        return cvRepository.findByUserAndIsActive(user.get(), true);
    }

    @Override
    public CV updateCVStatus(UUID id, String status, String errorMessage) {
        
        CV cv = cvRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CV not found with id: " + id));
        
        cv.setStatus(status);
        if (errorMessage != null) {
            cv.setErrorMessage(errorMessage);
        }
        
        CV updatedCV = cvRepository.save(cv);
        
        // Update user profile status
        Profile user = cv.getUser();
        user.setCvProcessingStatus(status);
        user.setCvProcessingError(errorMessage);
        profileRepository.save(user);
        
        // If CV is complete, generate job matches
        if ("complete".equals(status) || "completed".equals(status)) {
            try {
                jobMatchingService.calculateMatchesForCV(updatedCV);
            } catch (Exception e) {
            }
        }
        
        return updatedCV;
    }

    @Override
    public CV updateCVAnalysis(UUID id, Map<String, Object> analysisData) {
        
        CV cv = cvRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CV not found with id: " + id));
        
        try {
            String analysisJson = objectMapper.writeValueAsString(analysisData);
            cv.setAnalysisResults(analysisJson);
            cv.setLastAnalyzedAt(OffsetDateTime.now());
            
            if (analysisData.containsKey("extractedSkills")) {
                cv.setExtractedSkills(objectMapper.writeValueAsString(analysisData.get("extractedSkills")));
            }
            
            if (analysisData.containsKey("skills")) {
                cv.setSkills(objectMapper.writeValueAsString(analysisData.get("skills")));
            }
            
            return cvRepository.save(cv);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to update CV analysis", e);
        }
    }

    @Override
    public CV setCVActive(UUID id) {
        
        CV cv = cvRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CV not found with id: " + id));
        
        Profile user = cv.getUser();
        
        // Deactivate all other CVs for this user
        List<CV> userCVs = cvRepository.findByUser(user);
        for (CV userCV : userCVs) {
            if (!userCV.getId().equals(id)) {
                userCV.setIsActive(false);
                cvRepository.save(userCV);
            }
        }
        
        // Set this CV as active
        cv.setIsActive(true);
        return cvRepository.save(cv);
    }

    @Override
    public void deleteCV(UUID id) {
        
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isPresent()) {
            CV cv = cvOpt.get();
            
            // If this is the active CV and the user has other CVs, set another one as active
            if (cv.getIsActive()) {
                List<CV> otherCVs = cvRepository.findByUser(cv.getUser()).stream()
                        .filter(c -> !c.getId().equals(id))
                        .collect(Collectors.toList());
                
                if (!otherCVs.isEmpty()) {
                    // Set the newest version as active
                    otherCVs.sort((a, b) -> b.getVersion().compareTo(a.getVersion()));
                    otherCVs.get(0).setIsActive(true);
                    cvRepository.save(otherCVs.get(0));
                } else {
                    // If this was the only CV, update user profile
                    Profile user = cv.getUser();
                    user.setHasUploadedCv(false);
                    profileRepository.save(user);
                }
            }
            
            cvRepository.deleteById(id);
        }
    }
    
    private String calculateFileHash(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(file.getBytes());
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString(); // Fallback to random UUID if hashing fails
        }
    }
} 