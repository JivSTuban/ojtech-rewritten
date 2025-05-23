package com.melardev.spring.jwtoauth.services;

import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobMatch;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.JobMatchRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class JobMatchService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private JobMatchRepository jobMatchRepository;
    
    @Autowired
    private CVRepository cvRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    
    private final RestTemplate restTemplate = new RestTemplate();

    public List<JobMatch> findMatchesForStudent(UUID studentId, Double minScore) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Get all active jobs
        List<Job> activeJobs = jobRepository.findByActiveTrue();
        
        // If no active jobs in database, try to fetch from API
        if (activeJobs.isEmpty()) {
            activeJobs = fetchJobsFromApi();
            
            // If still no jobs, log error and return empty list
            if (activeJobs.isEmpty()) {
                System.err.println("No active jobs found in database or API");
                return new ArrayList<>();
            }
        }
        
        System.out.println("Found " + activeJobs.size() + " active jobs to process");
        
        List<JobMatch> matches = new ArrayList<>();
        
        // Get student's active CV
        CV activeCv = null;
        if (student.getActiveCvId() != null) {
            activeCv = cvRepository.findById(student.getActiveCvId()).orElse(null);
        }
        
        // Extract student skills as a list
        List<String> studentSkills = parseSkills(student.getSkills());
        System.out.println("Student skills: " + String.join(", ", studentSkills));
        
        // Process each job and wait for AI response
        for (Job job : activeJobs) {
            try {
                System.out.println("Processing job: " + job.getTitle() + " (ID: " + job.getId() + ")");
                System.out.println("Job required skills: " + job.getRequiredSkills());
                
                // Calculate match score using AI (now in percentage scale 1-100)
                Double matchScore = calculateMatchScore(student, studentSkills, activeCv, job);
                System.out.println("Match score calculated: " + matchScore);
                
                // Generate detailed match explanation
                String matchDetails = generateMatchDetails(student, studentSkills, activeCv, job);
                
                // Create and save job match
                JobMatch jobMatch = new JobMatch(job, student, matchScore);
                jobMatch.setMatchDetails(matchDetails);
                jobMatch.setMatchedAt(LocalDateTime.now());
                
                // Save to database
                JobMatch savedMatch = jobMatchRepository.save(jobMatch);
                matches.add(savedMatch);
                
                System.out.println("Job match saved with ID: " + savedMatch.getId());
            } catch (Exception e) {
                System.err.println("Error processing job " + job.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // Sort matches by score (highest first)
        matches.sort((a, b) -> b.getMatchScore().compareTo(a.getMatchScore()));
        
        System.out.println("Total matches found: " + matches.size());
        return matches;
    }
    
    private List<String> parseSkills(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // Try to parse as JSON array if it starts with [ and ends with ]
        if (skillsString.trim().startsWith("[") && skillsString.trim().endsWith("]")) {
            try {
                // Simple JSON array parsing
                String trimmed = skillsString.trim();
                trimmed = trimmed.substring(1, trimmed.length() - 1); // Remove [ ]
                String[] items = trimmed.split(",");
                List<String> skills = new ArrayList<>();
                
                for (String item : items) {
                    // Remove quotes and trim
                    String skill = item.trim();
                    if (skill.startsWith("\"") && skill.endsWith("\"")) {
                        skill = skill.substring(1, skill.length() - 1);
                    }
                    if (!skill.isEmpty()) {
                        skills.add(skill);
                    }
                }
                
                return skills;
            } catch (Exception e) {
                // Fall back to comma-separated parsing
            }
        }
        
        // Parse as comma-separated list
        String[] skills = skillsString.split(",");
        List<String> skillsList = new ArrayList<>();
        for (String skill : skills) {
            String trimmed = skill.trim();
            if (!trimmed.isEmpty()) {
                skillsList.add(trimmed);
            }
        }
        return skillsList;
    }
    
    private List<Job> fetchJobsFromApi() {
        try {
            ResponseEntity<List<Job>> response = restTemplate.exchange(
                "http://localhost:8080/api/jobs",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Job>>() {}
            );
            
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Error fetching jobs from API: " + e.getMessage());
        }
        
        return new ArrayList<>();
    }
    
    public List<JobMatch> getStudentMatches(UUID studentId) {
        return jobMatchRepository.findByStudentIdOrderByMatchScoreDesc(studentId);
    }
    
    private Double calculateMatchScore(StudentProfile student, List<String> studentSkills, CV cv, Job job) {
        // First, calculate a direct skill match percentage
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        
        // Calculate matching skills
        List<String> matchingSkills = new ArrayList<>();
        for (String jobSkill : jobSkills) {
            for (String studentSkill : studentSkills) {
                if (studentSkill.equalsIgnoreCase(jobSkill) || 
                    jobSkill.toLowerCase().contains(studentSkill.toLowerCase()) || 
                    studentSkill.toLowerCase().contains(jobSkill.toLowerCase())) {
                    matchingSkills.add(jobSkill);
                    break;
                }
            }
        }
        
        // Calculate direct skill match percentage
        double directMatchPercentage = jobSkills.isEmpty() ? 0 : 
            (double) matchingSkills.size() / jobSkills.size() * 100;
        
        System.out.println("Direct skill match: " + matchingSkills.size() + "/" + jobSkills.size() + 
            " (" + Math.round(directMatchPercentage) + "%)");
        
        // If we have a good direct match (over 40%), we can return that
        if (directMatchPercentage >= 40) {
            return directMatchPercentage;
        }
        
        // Otherwise, use AI for a more nuanced analysis
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher. Your task is to analyze the compatibility between a job and a student's profile. ");
        prompt.append("Return a match score between 1 and 100, where 100 is a perfect match. ");
        prompt.append("Only return the numeric score as an integer between 1 and 100, nothing else. \n\n");
        
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("STUDENT DETAILS:\n");
        prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n");
        prompt.append("Major: ").append(student.getMajor()).append("\n");
        
        if (cv != null) {
            prompt.append("CV Content: ").append(cv.getParsedResume()).append("\n");
        }
        
        // Add a specific instruction for skill matching
        prompt.append("\nPLEASE ANALYZE:\n");
        prompt.append("1. Compare the student's skills [").append(String.join(", ", studentSkills)).append("] ");
        prompt.append("with the job's required skills [").append(String.join(", ", jobSkills)).append("]\n");
        prompt.append("2. Consider the relevance of the student's major to the job\n");
        prompt.append("3. Consider any relevant experience from the CV\n");
        prompt.append("4. Return a single number between 1-100 representing the match percentage\n");
        prompt.append("5. IMPORTANT: If the student has Java, Spring Boot, and React skills, and the job requires these, give at least a 60% match\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            System.out.println("Sending request to Gemini API for match score calculation");
            Map<String, Object> response = restTemplate.postForObject(
                GEMINI_API_URL, entity, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) candidate.get("content");
                    if (!contentList.isEmpty()) {
                        Map<String, Object> contentItem = contentList.get(0);
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentItem.get("parts");
                        if (!responseParts.isEmpty()) {
                            String scoreText = (String) responseParts.get(0).get("text");
                            System.out.println("Received score from AI: " + scoreText);
                            try {
                                // Parse as double to handle any decimal responses, then ensure it's in range 1-100
                                double score = Double.parseDouble(scoreText.trim());
                                // Ensure the score is within the 1-100 range
                                return Math.min(100.0, Math.max(1.0, score));
                            } catch (NumberFormatException e) {
                                System.err.println("Error parsing score from AI: " + e.getMessage());
                                return Math.max(directMatchPercentage, 1.0); // Fall back to direct match
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            e.printStackTrace();
        }
        
        // If AI fails, return the direct match percentage
        return Math.max(directMatchPercentage, 1.0);
    }
    
    private String generateMatchDetails(StudentProfile student, List<String> studentSkills, CV cv, Job job) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher. Analyze the compatibility between this job and student profile. ");
        prompt.append("Provide a brief explanation (max 1500 characters) of why they match or don't match. ");
        prompt.append("Focus on skills alignment, experience relevance, and education fit. ");
        prompt.append("Be specific about strengths and gaps. Also include a percentage match score (1-100%) at the end.\n\n");
        
        // Parse job required skills
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("STUDENT DETAILS:\n");
        prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n");
        prompt.append("Major: ").append(student.getMajor()).append("\n");
        prompt.append("University: ").append(student.getUniversity()).append("\n");
        prompt.append("Graduation Year: ").append(student.getGraduationYear()).append("\n");
        
        if (cv != null) {
            prompt.append("CV Content: ").append(cv.getParsedResume()).append("\n");
        }
        
        // Add specific instructions for detailed analysis
        prompt.append("\nPLEASE PROVIDE:\n");
        prompt.append("1. A detailed analysis of skill match between student skills [").append(String.join(", ", studentSkills)).append("] ");
        prompt.append("and job required skills [").append(String.join(", ", jobSkills)).append("]\n");
        prompt.append("2. Identify which skills match and which are missing\n");
        prompt.append("3. Suggest how the student could improve their profile for this job\n");
        prompt.append("4. Include a final match percentage (1-100%) at the end\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(
                GEMINI_API_URL, entity, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) candidate.get("content");
                    if (!contentList.isEmpty()) {
                        Map<String, Object> contentItem = contentList.get(0);
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentItem.get("parts");
                        if (!responseParts.isEmpty()) {
                            String details = (String) responseParts.get(0).get("text");
                            // Limit to 2000 characters (column limit)
                            if (details.length() > 2000) {
                                details = details.substring(0, 1997) + "...";
                            }
                            return details;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return "No match details available.";
    }
    
    public JobMatch markAsViewed(UUID jobMatchId, UUID studentId) {
        JobMatch jobMatch = jobMatchRepository.findById(jobMatchId)
                .orElseThrow(() -> new RuntimeException("Job match not found"));
        
        // Verify ownership
        if (!jobMatch.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You do not have permission to access this job match");
        }
        
        jobMatch.setViewed(true);
        return jobMatchRepository.save(jobMatch);
    }

    public boolean hasGeminiApiKey() {
        return geminiApiKey != null && !geminiApiKey.trim().isEmpty();
    }
    
    public String generateSkillMatchAnalysis(List<String> studentSkills, List<String> jobSkills) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher. Your task is to analyze the compatibility between a student's skills and job required skills. ");
        prompt.append("Provide a detailed analysis of the match, focusing on strengths and gaps. ");
        prompt.append("Be specific about which skills match and which are missing. Also suggest how the student could improve their profile. ");
        prompt.append("Include a final match percentage (1-100%) at the end.\n\n");
        
        prompt.append("STUDENT SKILLS:\n");
        prompt.append(String.join(", ", studentSkills)).append("\n\n");
        
        prompt.append("JOB REQUIRED SKILLS:\n");
        prompt.append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("PLEASE PROVIDE:\n");
        prompt.append("1. A detailed analysis of skill match between student skills and job required skills\n");
        prompt.append("2. Identify which skills match and which are missing\n");
        prompt.append("3. Suggest how the student could improve their profile for this job\n");
        prompt.append("4. Include a final match percentage (1-100%) at the end\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(
                GEMINI_API_URL, entity, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) candidate.get("content");
                    if (!contentList.isEmpty()) {
                        Map<String, Object> contentItem = contentList.get(0);
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentItem.get("parts");
                        if (!responseParts.isEmpty()) {
                            return (String) responseParts.get(0).get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return "Unable to generate AI analysis.";
    }
} 