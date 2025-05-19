package com.ojtech.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ojtech.api.model.*;
import com.ojtech.api.repository.JobRepository;
import com.ojtech.api.repository.MatchRepository;
import com.ojtech.api.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class JobMatchingServiceImpl implements JobMatchingService {

    private static final Logger log = LoggerFactory.getLogger(JobMatchingServiceImpl.class);

    private final JobRepository jobRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MatchRepository matchRepository;
    private final ObjectMapper objectMapper;

    public JobMatchingServiceImpl(JobRepository jobRepository, 
                                StudentProfileRepository studentProfileRepository, 
                                MatchRepository matchRepository, 
                                ObjectMapper objectMapper) {
        this.jobRepository = jobRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.matchRepository = matchRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void calculateMatchesForCV(CV cv) {
        if (cv == null || cv.getUser() == null) {
            log.warn("CV or CV User is null, cannot calculate matches.");
            return;
        }
        try {
            Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByProfile(cv.getUser());
            if (studentProfileOpt.isEmpty()) {
                log.warn("StudentProfile not found for CV user ID: {}, skipping match calculation.", cv.getUser().getId());
                return;
            }
            StudentProfile studentProfile = studentProfileOpt.get();

            List<Job> jobs = jobRepository.findByStatus("open"); // Consider a more robust way to get active jobs
            log.debug("Found {} active jobs to match against for student ID: {}", jobs.size(), studentProfile.getId());

            for (Job job : jobs) {
                double score = calculateAiMatchScore(cv, job);
                BigDecimal matchScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);

                Optional<Match> existingMatch = matchRepository.findByStudentAndJob(studentProfile, job);
                if (existingMatch.isPresent()) {
                    Match match = existingMatch.get();
                    match.setMatchScore(matchScore);
                    matchRepository.save(match);
                    log.info("Updated match for student ID: {}, job ID: {}, new score: {}", studentProfile.getId(), job.getId(), matchScore);
                } else {
                    Match newMatch = Match.builder()
                            .student(studentProfile)
                            .job(job)
                            .matchScore(matchScore)
                            .status("pending") // Default status
                            .build();
                    matchRepository.save(newMatch);
                    log.info("Created new match for student ID: {}, job ID: {}, score: {}", studentProfile.getId(), job.getId(), matchScore);
                }
            }
        } catch (Exception e) {
            log.error("Failed to calculate job matches for CV ID {}: {}", cv.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to calculate job matches for CV", e);
        }
    }

    @Override
    public void calculateMatchesForJob(Job job) {
        if (job == null) {
            log.warn("Job is null, cannot calculate matches.");
            return;
        }
        try {
            List<StudentProfile> studentProfiles = studentProfileRepository.findAll();
            log.debug("Found {} student profiles to match against for job ID: {}", studentProfiles.size(), job.getId());

            for (StudentProfile studentProfile : studentProfiles) {
                if (studentProfile.getProfile() == null || studentProfile.getProfile().getCvs() == null) {
                    log.warn("Student profile or CV list is null for student ID: {}, skipping.", studentProfile.getId());
                    continue;
                }
                Optional<CV> activeCv = studentProfile.getProfile().getCvs().stream()
                        .filter(CV::getIsActive)
                        .findFirst();
                
                if (activeCv.isPresent()) {
                    CV cv = activeCv.get();
                    double score = calculateAiMatchScore(cv, job);
                    BigDecimal matchScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);

                    Optional<Match> existingMatch = matchRepository.findByStudentAndJob(studentProfile, job);
                    if (existingMatch.isPresent()) {
                        Match match = existingMatch.get();
                        match.setMatchScore(matchScore);
                        matchRepository.save(match);
                        log.info("Updated match during job update for student ID: {}, job ID: {}, new score: {}", studentProfile.getId(), job.getId(), matchScore);
                    } else {
                        Match newMatch = Match.builder()
                                .student(studentProfile)
                                .job(job)
                                .matchScore(matchScore)
                                .status("pending")
                                .build();
                        matchRepository.save(newMatch);
                        log.info("Created new match during job update for student ID: {}, job ID: {}, score: {}", studentProfile.getId(), job.getId(), matchScore);
                    }
                } else {
                    log.warn("No active CV found for student profile ID: {}", studentProfile.getId());
                }
            }
        } catch (Exception e) {
            log.error("Failed to calculate student matches for job ID {}: {}", job.getId(), e.getMessage(), e);
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
        if (cv == null || job == null) {
            log.warn("CV or Job is null, cannot calculate match score.");
            return 0.0;
        }
        try {
            // Get the skills from CV and Job
            String cvSkillsJson = cv.getSkills() != null ? cv.getSkills() : "[]";
            String extractedSkillsJson = cv.getExtractedSkills() != null ? cv.getExtractedSkills() : "[]";
            
            // Convert Job's List<String> to JSON string first if needed
            List<String> requiredSkillsList = job.getRequiredSkills();
            List<String> preferredSkillsList = job.getPreferredSkills();
            
            String requiredSkillsJson = requiredSkillsList != null ? objectMapper.writeValueAsString(requiredSkillsList) : "[]";
            String preferredSkillsJson = preferredSkillsList != null ? objectMapper.writeValueAsString(preferredSkillsList) : "[]";
            
            // Parse the skills as JSON nodes
            JsonNode cvSkills = parseJsonField(cvSkillsJson);
            JsonNode extractedSkills = parseJsonField(extractedSkillsJson);
            JsonNode requiredSkills = parseJsonField(requiredSkillsJson);
            JsonNode preferredSkills = parseJsonField(preferredSkillsJson);
            
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
            
            log.debug("CV ID: {}, Job ID: {}, Calculated Score: {:.2f}, Required Matched: {}/{}, Preferred Matched: {}/{}", 
                    cv.getId(), job.getId(), score, requiredSkillsMatched, totalRequiredSkills,
                    preferredSkillsMatched, totalPreferredSkills);
            
            return score;
        } catch (Exception e) {
            log.error("Error calculating AI match score for CV ID {} and Job ID {}: {}", cv.getId(), job.getId(), e.getMessage(), e);
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