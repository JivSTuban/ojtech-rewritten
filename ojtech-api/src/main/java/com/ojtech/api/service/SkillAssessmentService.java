package com.ojtech.api.service;

import com.ojtech.api.model.SkillAssessment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillAssessmentService {
    List<SkillAssessment> getSkillsByUser(UUID userId);
    Optional<SkillAssessment> getSkillById(UUID id);
    Optional<SkillAssessment> getSkillByUserAndName(UUID userId, String skillName);
    List<String> getAllSkillNames();
    SkillAssessment createSkillAssessment(SkillAssessment skillAssessment);
    SkillAssessment updateSkillAssessment(UUID id, SkillAssessment skillAssessment);
    void deleteSkillAssessment(UUID id);
} 