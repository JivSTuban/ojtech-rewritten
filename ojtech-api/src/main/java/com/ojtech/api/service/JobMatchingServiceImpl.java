package com.ojtech.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.MatchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

@Transactional

public class JobMatchingServiceImpl implements JobMatchingService {

    private final JobRepository jobRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MatchRepository matchRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void calculateMatchesForCV(CV cv) {
        try {
            // Get the student profile
            Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByProfile(cv.getUser());
            if (studentProfileOpt.isEmpty()) {
                return;
            }
            StudentProfile studentProfile = studentProfileOpt.get();

            // Get all active jobs
            List<Job> jobs = jobRepository.findByStatus("open");

            // For each job, calculate match score and save or update match
            for (Job job : jobs) {
                double score = calculateAiMatchScore(cv, job);
                BigDecimal matchScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);

                // Find existing match or create new one
                Optional<Match> existingMatch = matchRepository.findByStudentAndJob(studentProfile, job);
                if (existingMatch.isPresent()) {
                    Match match = existingMatch.get();
                    match.setMatchScore(matchScore);
                    matchRepository.save(match);
                            studentProfile.getId(), job.getId(), matchScore);
                } else {
                    Match newMatch = Match.builder()
                            .student(studentProfile)
                            .job(job)
                            .matchScore(matchScore)
                            .status("pending")
                            .build();
                    matchRepository.save(newMatch);
                            studentProfile.getId(), job.getId(), matchScore);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate job matches for CV", e);
        }
    }

    @Override
    public void calculateMatchesForJob(Job job) {
        try {
            List<StudentProfile> studentProfiles = studentProfileRepository.findAll();

            for (StudentProfile studentProfile : studentProfiles) {
                // Find active CV for this student
                Optional<CV> activeCv = studentProfile.getProfile().getCvs().stream()
                        .filter(CV::getIsActive)
                        .findFirst();
                
                if (activeCv.isPresent()) {
                    CV cv = activeCv.get();
                    double score = calculateAiMatchScore(cv, job);
                    BigDecimal matchScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);

                    // Find existing match or create new one
                    Optional<Match> existingMatch = matchRepository.findByStudentAndJob(studentProfile, job);
                    if (existingMatch.isPresent()) {
                        Match match = existingMatch.get();
                        match.setMatchScore(matchScore);
                        matchRepository.save(match);
                                studentProfile.getId(), job.getId(), matchScore);
                    } else {
                        Match newMatch = Match.builder()
                                .student(studentProfile)
                                .job(job)
                                .matchScore(matchScore)
                                .status("pending")
                                .build();
                        matchRepository.save(newMatch);
                                studentProfile.getId(), job.getId(), matchScore);
                    }
                } else {
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate student matches for job", e);
        }
    }

    @Override
    public List<Match> getMatchesForStudent(UUID studentId) {
        Optional<StudentProfile> studentProfile = studentProfileRepository.findById(studentId);
        if (studentProfile.isEmpty()) {
            throw new RuntimeException("Student profile not found with id: " + studentId);
        }
        return matchRepository.findByStudent(studentProfile.get());
    }

    @Override
    public List<Match> getMatchesForJob(UUID jobId) {
        Optional<Job> job = jobRepository.findById(jobId);
        if (job.isEmpty()) {
            throw new RuntimeException("Job not found with id: " + jobId);
        }
        return matchRepository.findByJob(job.get());
    }

    @Override
    public Match getMatchById(UUID matchId) {
        return matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
    }

    @Override
    public void updateMatchStatus(UUID matchId, String status) {
        Match match = getMatchById(matchId);
        match.setStatus(status);
        matchRepository.save(match);
    }

    @Override
    public void deleteMatch(UUID matchId) {
        matchRepository.deleteById(matchId);
    }

    @Override
    public double calculateAiMatchScore(CV cv, Job job) {
        try {
            // Parse the CV skills and job required skills from JSON
            JsonNode cvSkills = parseJsonField(cv.getSkills());
            JsonNode extractedSkills = parseJsonField(cv.getExtractedSkills());
            JsonNode requiredSkills = parseJsonField(job.getRequiredSkills());
            JsonNode preferredSkills = parseJsonField(job.getPreferredSkills());
            
            if (cvSkills == null || requiredSkills == null) {
                return 0.0;
            }

            // Implement matching algorithm
            // This is a simplified version - you would implement a more sophisticated algorithm
            double score = 0.0;
            int requiredSkillsMatched = 0;
            int totalRequiredSkills = 0;
            
            // Count matching required skills
            if (requiredSkills.isArray()) {
                totalRequiredSkills = requiredSkills.size();
                for (JsonNode requiredSkill : requiredSkills) {
                    String skillName = requiredSkill.asText().toLowerCase();
                    if (hasSkill(cvSkills, skillName) || hasSkill(extractedSkills, skillName)) {
                        requiredSkillsMatched++;
                    }
                }
            }
            
            // Calculate base score from required skills (0-70 points)
            double requiredSkillsScore = 0;
            if (totalRequiredSkills > 0) {
                requiredSkillsScore = 70.0 * ((double) requiredSkillsMatched / totalRequiredSkills);
            }
            
            // Calculate preferred skills score (0-30 points)
            double preferredSkillsScore = 0;
            int preferredSkillsMatched = 0;
            int totalPreferredSkills = 0;
            
            if (preferredSkills != null && preferredSkills.isArray()) {
                totalPreferredSkills = preferredSkills.size();
                for (JsonNode preferredSkill : preferredSkills) {
                    String skillName = preferredSkill.asText().toLowerCase();
                    if (hasSkill(cvSkills, skillName) || hasSkill(extractedSkills, skillName)) {
                        preferredSkillsMatched++;
                    }
                }
                
                if (totalPreferredSkills > 0) {
                    preferredSkillsScore = 30.0 * ((double) preferredSkillsMatched / totalPreferredSkills);
                }
            }
            
            // Calculate final score
            score = requiredSkillsScore + preferredSkillsScore;
            
            // Ensure score is between 0 and 100
            score = Math.max(0, Math.min(100, score));
            
                    cv.getId(), job.getId(), score, requiredSkillsMatched, totalRequiredSkills,
                    preferredSkillsMatched, totalPreferredSkills);
            
            return score;
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    private JsonNode parseJsonField(String jsonString) {
        if (jsonString == null || jsonString.isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.readTree(jsonString);
        } catch (Exception e) {
            return null;
        }
    }
    
    private boolean hasSkill(JsonNode skills, String skillName) {
        if (skills == null) {
            return false;
        }
        
        if (skills.isArray()) {
            for (JsonNode skill : skills) {
                if (skill.isTextual() && skill.asText().toLowerCase().contains(skillName)) {
                    return true;
                }
            }
        } else if (skills.isObject()) {
            // Handle object format where skills might be keys or nested values
            return skills.toString().toLowerCase().contains(skillName);
        }
        
        return false;
    }
} 