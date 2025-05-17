package com.ojtech.api.repository;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.SkillAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillAssessmentRepository extends JpaRepository<SkillAssessment, UUID> {
    
    List<SkillAssessment> findByUser(Profile user);
    
    Optional<SkillAssessment> findByUserAndSkillName(Profile user, String skillName);
    
    List<SkillAssessment> findByUserAndProficiencyLevelGreaterThanEqual(Profile user, Integer minLevel);
    
    @Query("SELECT sa FROM SkillAssessment sa WHERE sa.user = ?1 ORDER BY sa.proficiencyLevel DESC")
    List<SkillAssessment> findByUserOrderByProficiencyLevelDesc(Profile user);
    
    @Query("SELECT DISTINCT sa.skillName FROM SkillAssessment sa ORDER BY sa.skillName")
    List<String> findAllDistinctSkillNames();

    List<SkillAssessment> findBySkillNameContainingIgnoreCase(String skillName);
} 