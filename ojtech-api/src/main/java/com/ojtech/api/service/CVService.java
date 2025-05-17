package com.ojtech.api.service;

import com.ojtech.api.model.CV;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface CVService {
    CV uploadCV(UUID userId, MultipartFile file);
    Optional<CV> getCVById(UUID id);
    List<CV> getAllCVsByUser(UUID userId);
    List<CV> getActiveCVsByUser(UUID userId);
    CV updateCVStatus(UUID id, String status, String errorMessage);
    CV updateCVAnalysis(UUID id, Map<String, Object> analysisData);
    CV setCVActive(UUID id);
    void deleteCV(UUID id);
} 