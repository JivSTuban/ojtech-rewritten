package com.ojtech.api.service;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.SkillAssessment;
import com.ojtech.api.repository.ProfileRepository;
import com.ojtech.api.repository.SkillAssessmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SkillAssessmentServiceImpl implements SkillAssessmentService {

    private static final Logger log = LoggerFactory.getLogger(SkillAssessmentServiceImpl.class);

    private final SkillAssessmentRepository skillAssessmentRepository;
    private final ProfileRepository profileRepository;

    public SkillAssessmentServiceImpl(SkillAssessmentRepository skillAssessmentRepository, 
                                      ProfileRepository profileRepository) {
        this.skillAssessmentRepository = skillAssessmentRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    public List<SkillAssessment> getSkillsByUser(UUID userId) {
        log.debug("Fetching skills for user ID: {}", userId);
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return skillAssessmentRepository.findByUser(user);
    }

    @Override
    public Optional<SkillAssessment> getSkillById(UUID id) {
        log.debug("Fetching skill by ID: {}", id);
        return skillAssessmentRepository.findById(id);
    }

    @Override
    public Optional<SkillAssessment> getSkillByUserAndName(UUID userId, String skillName) {
        log.debug("Fetching skill for user ID: {} and skill name: {}", userId, skillName);
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return skillAssessmentRepository.findByUserAndSkillName(user, skillName);
    }

    @Override
    public List<String> getAllSkillNames() {
        log.debug("Fetching all distinct skill names.");
        return skillAssessmentRepository.findAllDistinctSkillNames();
    }

    @Override
    public SkillAssessment createSkillAssessment(SkillAssessment skillAssessment) {
        if (skillAssessment == null) {
            throw new IllegalArgumentException("SkillAssessment object cannot be null.");
        }
        log.info("Attempting to create/update skill assessment for skill: {}, user ID: {}", 
                 skillAssessment.getSkillName(), 
                 skillAssessment.getUser() != null && skillAssessment.getUser().getId() != null ? skillAssessment.getUser().getId() : "unknown");
        
        if (skillAssessment.getUser() != null && skillAssessment.getUser().getId() != null) {
            Profile user = profileRepository.findById(skillAssessment.getUser().getId())
                    .orElseThrow(() -> {
                        log.error("User not found with id: {} when creating skill assessment for skill: {}", skillAssessment.getUser().getId(), skillAssessment.getSkillName());
                        return new RuntimeException("User not found with id: " + skillAssessment.getUser().getId());
                    });
            skillAssessment.setUser(user); // Ensure the managed entity is set
            
            Optional<SkillAssessment> existingSkill = 
                    skillAssessmentRepository.findByUserAndSkillName(user, skillAssessment.getSkillName());
            
            if (existingSkill.isPresent()) {
                log.info("Updating existing skill '{}' for user ID: {}", skillAssessment.getSkillName(), user.getId());
                SkillAssessment skillToUpdate = existingSkill.get();
                skillToUpdate.setProficiencyLevel(skillAssessment.getProficiencyLevel());
                skillToUpdate.setDescription(skillAssessment.getDescription());
                // user and skillName remain the same for existing skill
                return skillAssessmentRepository.save(skillToUpdate);
            }
        } else {
            log.warn("Skill assessment is being created without a valid user or user ID. Skill: {}", skillAssessment.getSkillName());
            // Decide if this is permissible or should throw an error
        }
        
        log.info("Creating new skill assessment for skill: {}", skillAssessment.getSkillName());
        return skillAssessmentRepository.save(skillAssessment);
    }

    @Override
    public SkillAssessment updateSkillAssessment(UUID id, SkillAssessment skillAssessmentDetails) {
        if (skillAssessmentDetails == null) {
            throw new IllegalArgumentException("SkillAssessmentDetails object cannot be null for update.");
        }
        log.info("Updating skill assessment with ID: {}", id);
        return skillAssessmentRepository.findById(id)
                .map(existingSkill -> {
                    log.debug("Found skill assessment to update. Skill name: {}, current proficiency: {}", existingSkill.getSkillName(), existingSkill.getProficiencyLevel());
                    // User should not change during an update of a skill assessment via this method
                    // If user needs to change, it's a different operation or delete and create new.
                    if (skillAssessmentDetails.getUser() != null && !existingSkill.getUser().getId().equals(skillAssessmentDetails.getUser().getId())){
                        log.warn("Attempt to change user ID during skill assessment update from {} to {} is not allowed. Ignoring.", existingSkill.getUser().getId(), skillAssessmentDetails.getUser().getId());
                    }
                    
                    existingSkill.setSkillName(skillAssessmentDetails.getSkillName());
                    existingSkill.setProficiencyLevel(skillAssessmentDetails.getProficiencyLevel());
                    existingSkill.setDescription(skillAssessmentDetails.getDescription());
                    // existingSkill.setUser(user); // User is intentionally not changed here
                    
                    return skillAssessmentRepository.save(existingSkill);
                })
                .orElseThrow(() -> {
                    log.error("Skill assessment not found with ID: {} during update.", id);
                    return new RuntimeException("Skill assessment not found with id: " + id);
                });
    }

    @Override
    public void deleteSkillAssessment(UUID id) {
        log.info("Deleting skill assessment with ID: {}", id);
        if (!skillAssessmentRepository.existsById(id)) {
            log.error("Attempted to delete non-existent skill assessment with ID: {}", id);
            throw new RuntimeException("Skill assessment not found with id: " + id);
        }
        skillAssessmentRepository.deleteById(id);
        log.info("Successfully deleted skill assessment with ID: {}", id);
    }
} 