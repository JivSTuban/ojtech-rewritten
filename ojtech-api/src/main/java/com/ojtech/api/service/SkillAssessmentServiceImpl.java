package com.ojtech.api.service;

import com.ojtech.api.model.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.SkillAssessment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.SkillAssessmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

@Transactional

public class SkillAssessmentServiceImpl implements SkillAssessmentService {

    private final SkillAssessmentRepository skillAssessmentRepository;
    private final ProfileRepository profileRepository;

    @Override
    public List<SkillAssessment> getSkillsByUser(UUID userId) {
        
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return skillAssessmentRepository.findByUser(user);
    }

    @Override
    public Optional<SkillAssessment> getSkillById(UUID id) {
        return skillAssessmentRepository.findById(id);
    }

    @Override
    public Optional<SkillAssessment> getSkillByUserAndName(UUID userId, String skillName) {
        
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return skillAssessmentRepository.findByUserAndSkillName(user, skillName);
    }

    @Override
    public List<String> getAllSkillNames() {
        return skillAssessmentRepository.findAllDistinctSkillNames();
    }

    @Override
    public SkillAssessment createSkillAssessment(SkillAssessment skillAssessment) {
                skillAssessment.getSkillName(),
                skillAssessment.getUser() != null ? skillAssessment.getUser().getId() : "unknown");
        
        // Ensure the user profile exists
        if (skillAssessment.getUser() != null && skillAssessment.getUser().getId() != null) {
            Profile user = profileRepository.findById(skillAssessment.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + 
                            skillAssessment.getUser().getId()));
            
            skillAssessment.setUser(user);
            
            // Check if a skill assessment with the same name already exists for this user
            Optional<SkillAssessment> existingSkill = 
                    skillAssessmentRepository.findByUserAndSkillName(user, skillAssessment.getSkillName());
            
            if (existingSkill.isPresent()) {
                        skillAssessment.getSkillName(), user.getId());
                
                SkillAssessment skill = existingSkill.get();
                skill.setProficiencyLevel(skillAssessment.getProficiencyLevel());
                skill.setDescription(skillAssessment.getDescription());
                
                return skillAssessmentRepository.save(skill);
            }
        }
        
        return skillAssessmentRepository.save(skillAssessment);
    }

    @Override
    public SkillAssessment updateSkillAssessment(UUID id, SkillAssessment skillAssessmentDetails) {
        
        return skillAssessmentRepository.findById(id)
                .map(existingSkill -> {
                    // Keep the same user reference
                    Profile user = existingSkill.getUser();
                    
                    existingSkill.setSkillName(skillAssessmentDetails.getSkillName());
                    existingSkill.setProficiencyLevel(skillAssessmentDetails.getProficiencyLevel());
                    existingSkill.setDescription(skillAssessmentDetails.getDescription());
                    
                    // Keep the original user reference
                    existingSkill.setUser(user);
                    
                    return skillAssessmentRepository.save(existingSkill);
                })
                .orElseThrow(() -> new RuntimeException("Skill assessment not found with id: " + id));
    }

    @Override
    public void deleteSkillAssessment(UUID id) {
        
        if (!skillAssessmentRepository.existsById(id)) {
            throw new RuntimeException("Skill assessment not found with id: " + id);
        }
        
        skillAssessmentRepository.deleteById(id);
    }
} 