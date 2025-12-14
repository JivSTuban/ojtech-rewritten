package com.ojtechapi.spring.jwtoauth.services;

import com.ojtechapi.spring.jwtoauth.entities.CV;
import com.ojtechapi.spring.jwtoauth.entities.Certification;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.entities.WorkExperience;
import com.ojtechapi.spring.jwtoauth.repositories.CVRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class CoverLetterService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private CVRepository cvRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    private String getGeminiApiUrl() {
        return GEMINI_API_BASE_URL + "?key=" + geminiApiKey;
    }
    
    /**
     * Generates a cover letter for a job application based on student profile, CV, and job details
     * using Gemini AI.
     * 
     * @param studentId The UUID of the student applying for the job
     * @param jobId The UUID of the job being applied for
     * @param cvId The UUID of the CV being used for the application
     * @return A generated cover letter as a string
     */
    public String generateCoverLetter(UUID studentId, UUID jobId, UUID cvId) {
        // Get student profile
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        // Get job details
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Get CV
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("cover letter generation");
            return generateBasicCoverLetter(student, job, cv);
        }
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert career advisor specializing in personalized cover letter creation. ");
        prompt.append("Create a professional, tailored cover letter for a job application using the student's comprehensive profile, CV details, and job description.\n\n");
        
        prompt.append("CONTENT REQUIREMENTS:\n");
        prompt.append("1. Opening Paragraph: Express interest in the specific position and briefly introduce the student's current status (major, university, graduation year)\n");
        prompt.append("2. Body Paragraph 1: Highlight relevant skills that match job requirements with specific examples from work experience or projects\n");
        prompt.append("3. Body Paragraph 2: Showcase additional qualifications such as certifications, technical competencies, and achievements that align with the role\n");
        prompt.append("4. Closing Paragraph: Express enthusiasm, mention the attached CV, request an interview, and thank them\n");
        prompt.append("5. Keep it concise and professional (3-4 well-structured paragraphs total)\n\n");
        
        prompt.append("WRITING GUIDELINES:\n");
        prompt.append("- Use the bio/summary information naturally to understand the student's background, but DO NOT copy-paste it verbatim\n");
        prompt.append("- Write in a professional, confident tone\n");
        prompt.append("- Focus on job-relevant qualifications only\n");
        prompt.append("- Avoid repetition and redundant phrases\n");
        prompt.append("- Do not cut off sentences mid-word\n");
        prompt.append("- Ensure smooth paragraph transitions\n\n");
        
        // Add student details
        prompt.append("STUDENT PROFILE:\n");
        prompt.append("Name: ").append(student.getFirstName()).append(" ").append(student.getLastName()).append("\n");
        prompt.append("Email: ").append(student.getEmail() != null ? student.getEmail() : "Not specified").append("\n");
        prompt.append("Phone: ").append(student.getPhoneNumber() != null ? student.getPhoneNumber() : "Not specified").append("\n");
        prompt.append("University: ").append(student.getUniversity() != null ? student.getUniversity() : "Not specified").append("\n");
        prompt.append("Major: ").append(student.getMajor() != null ? student.getMajor() : "Not specified").append("\n");
        prompt.append("Graduation Year: ").append(student.getGraduationYear() != null ? student.getGraduationYear() : "Not specified").append("\n");
        if (student.getBio() != null && !student.getBio().trim().isEmpty()) {
            prompt.append("Bio/Summary: ").append(student.getBio()).append("\n");
        }
        
        // Add skills
        List<String> studentSkills = parseSkills(student.getSkills());
        if (!studentSkills.isEmpty()) {
            prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n");
        }
        prompt.append("\n");
        
        // Add CV details if available
        if (cv.getParsedResume() != null && !cv.getParsedResume().isEmpty()) {
            prompt.append("CV DETAILS:\n").append(cv.getParsedResume()).append("\n\n");
        }
        
        // Add work experiences if available
        if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
            prompt.append("WORK EXPERIENCE:\n");
            cv.getExperiences().forEach(exp -> {
                prompt.append("- ").append(exp.getTitle()).append(" at ").append(exp.getCompany())
                      .append(" (").append(exp.getStartDate()).append(" - ")
                      .append(exp.getEndDate() != null ? exp.getEndDate() : "Present").append(")\n");
                if (exp.getDescription() != null && !exp.getDescription().trim().isEmpty()) {
                    prompt.append("  ").append(exp.getDescription()).append("\n");
                }
            });
            prompt.append("\n");
        }
        
        // Add certifications if available
        if (cv.getCertifications() != null && !cv.getCertifications().isEmpty()) {
            prompt.append("CERTIFICATIONS:\n");
            cv.getCertifications().forEach(cert -> {
                prompt.append("- ").append(cert.getName())
                      .append(" (").append(cert.getIssuer()).append(", ")
                      .append(cert.getDateReceived()).append(")\n");
            });
            prompt.append("\n");
        }
        
        // Add job details
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Company: ").append(job.getEmployer().getCompanyName()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Location: ").append(job.getLocation() != null ? job.getLocation() : "Not specified").append("\n");
        if (job.getEmploymentType() != null) {
            prompt.append("Employment Type: ").append(job.getEmploymentType()).append("\n");
        }
        if (job.getSalaryRange() != null) {
            prompt.append("Salary Range: ").append(job.getSalaryRange()).append("\n");
        }
        if (job.getRequirements() != null && !job.getRequirements().trim().isEmpty()) {
            prompt.append("Requirements: ").append(job.getRequirements()).append("\n");
        }
        if (job.getBenefits() != null && !job.getBenefits().trim().isEmpty()) {
            prompt.append("Benefits: ").append(job.getBenefits()).append("\n");
        }
        
        // Add job required skills
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        if (!jobSkills.isEmpty()) {
            prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n");
        }
        
        // Add employer details
        prompt.append("\nCOMPANY INFORMATION:\n");
        prompt.append("Company Name: ").append(job.getEmployer().getCompanyName()).append("\n");
        if (job.getEmployer().getContactPersonName() != null) {
            prompt.append("Contact Person: ").append(job.getEmployer().getContactPersonName()).append("\n");
        }
        if (job.getEmployer().getIndustry() != null) {
            prompt.append("Industry: ").append(job.getEmployer().getIndustry()).append("\n");
        }
        if (job.getEmployer().getCompanyDescription() != null) {
            prompt.append("Company Description: ").append(job.getEmployer().getCompanyDescription()).append("\n");
        }
        
        // Add matching analysis
        List<String> matchingSkills = new ArrayList<>(studentSkills);
        matchingSkills.retainAll(jobSkills);
        if (!matchingSkills.isEmpty()) {
            prompt.append("\nMATCHING SKILLS IDENTIFIED:\n");
            prompt.append(String.join(", ", matchingSkills)).append("\n");
        }
        
        prompt.append("\n");
        
        // Specify formatting requirements
        prompt.append("FORMATTING REQUIREMENTS (MUST FOLLOW EXACTLY):\n\n");
        prompt.append("The cover letter output must be ONLY the following structure with NO additional text:\n\n");
        prompt.append("[Current Date in format: Month DD, YYYY]\n");
        prompt.append("[blank line]\n");
        if (job.getEmployer().getContactPersonName() != null && !job.getEmployer().getContactPersonName().trim().isEmpty()) {
            prompt.append("Dear ").append(job.getEmployer().getContactPersonName()).append(",\n");
        } else {
            prompt.append("Dear Hiring Manager,\n");
        }
        prompt.append("[blank line]\n");
        prompt.append("[Opening paragraph - 3-4 sentences expressing interest and introducing qualifications]\n");
        prompt.append("[blank line]\n");
        prompt.append("[Body paragraph 1 - 4-5 sentences highlighting relevant skills and experience]\n");
        prompt.append("[blank line]\n");
        prompt.append("[Body paragraph 2 - 3-4 sentences showcasing additional qualifications]\n");
        prompt.append("[blank line]\n");
        prompt.append("[Closing paragraph - 2-3 sentences with call to action and gratitude]\n");
        prompt.append("[blank line]\n");
        prompt.append("Sincerely,\n");
        prompt.append(student.getFirstName()).append(" ").append(student.getLastName()).append("\n");
        
        prompt.append("\nCRITICAL RULES - VIOLATIONS WILL RESULT IN REJECTION:\n");
        prompt.append("✗ DO NOT add ANY text before the date line - the date MUST be the very first line\n");
        prompt.append("✗ DO NOT add subject lines, RE:, email headers, or introductory sentences\n");
        prompt.append("✗ DO NOT write 'I am writing to express...' before the date\n");
        prompt.append("✗ DO NOT copy-paste the bio verbatim - synthesize it professionally\n");
        prompt.append("✗ DO NOT include placeholders like [Your Address] in the output\n");
        prompt.append("✗ DO NOT add ANY text after the signature line with the student's name\n");
        prompt.append("✗ DO NOT add email, phone number, or any additional text after the name\n");
        prompt.append("✗ DO NOT repeat closing statements or paragraphs after Sincerely\n");
        prompt.append("✗ DO NOT cut off sentences mid-word\n");
        prompt.append("✗ DO NOT repeat information already stated\n");
        prompt.append("✓ The ABSOLUTE FIRST LINE must be the date (Month DD, YYYY format)\n");
        prompt.append("✓ START with the date as the very first line with NO text before it\n");
        prompt.append("✓ Write complete, well-formed sentences\n");
        prompt.append("✓ Keep paragraphs focused and concise\n");
        prompt.append("✓ The ABSOLUTE LAST LINE must be the student's name with NOTHING after it\n\n");
        
        prompt.append("Generate ONLY the cover letter content following the exact structure above. ");
        prompt.append("Do NOT add any introductory text, subject lines, or greeting before the date. ");
        prompt.append("Do NOT add any closing remarks, contact information, or additional paragraphs after the signature. ");
        prompt.append("The letter should demonstrate clear alignment between the student's qualifications and the job requirements. ");
        prompt.append("Make it professional, concise, and ready to send.");
        
        content.put("parts", Collections.singletonList(Collections.singletonMap("text", prompt.toString())));
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            System.out.println("Calling Gemini API for cover letter generation...");
            Map<String, Object> response = restTemplate.postForObject(
                getGeminiApiUrl(), entity, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    // Content is a single object, not a list
                    Map<String, Object> responseContent = (Map<String, Object>) candidate.get("content");
                    if (responseContent != null && responseContent.containsKey("parts")) {
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) responseContent.get("parts");
                        if (!responseParts.isEmpty()) {
                            String coverLetter = (String) responseParts.get(0).get("text");
                            System.out.println("Successfully received cover letter from Gemini API");
                            // Clean up the cover letter to ensure proper formatting
                            return cleanCoverLetterFormat(coverLetter, student, job);
                        }
                    }
                }
                logGeminiApiResponseError("cover letter", response);
            } else {
                logGeminiApiResponseError("cover letter", response);
            }
        } catch (Exception e) {
            logGeminiApiError("cover letter", e);
        }
        
        // Fallback to basic cover letter if API call fails
        return generateBasicCoverLetter(student, job, cv);
    }
    
    /**
     * Cleans and formats the cover letter to ensure proper structure
     * Removes any text that appears before the date and after the signature
     */
    private String cleanCoverLetterFormat(String coverLetter, StudentProfile student, Job job) {
        if (coverLetter == null || coverLetter.trim().isEmpty()) {
            return coverLetter;
        }
        
        // Get current date in Philippine Standard Time
        ZonedDateTime philippineTime = ZonedDateTime.now(ZoneId.of("Asia/Manila"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String currentDate = philippineTime.format(formatter);
        
        // Pattern to match date formats: "Month DD, YYYY" or "Month D, YYYY"
        String datePattern = "(?i)(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2},\\s+\\d{4}";
        
        // Find the first occurrence of a date pattern
        Pattern pattern = Pattern.compile(datePattern);
        Matcher matcher = pattern.matcher(coverLetter);
        
        String cleaned;
        if (matcher.find()) {
            int dateStartIndex = matcher.start();
            
            // Log if there's text before the date that will be removed
            if (dateStartIndex > 0) {
                String textBeforeDate = coverLetter.substring(0, dateStartIndex).trim();
                if (!textBeforeDate.isEmpty()) {
                    System.out.println("WARNING: Removing text before date: " + textBeforeDate);
                }
            }
            
            // Remove everything before the date
            String textAfterDate = coverLetter.substring(dateStartIndex).trim();
            
            // Replace the found date with current date to ensure consistency
            cleaned = textAfterDate.replaceFirst("(?i)(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2},\\s+\\d{4}", currentDate);
            
            // Ensure proper line breaks after date (should be \n\n)
            if (!cleaned.startsWith(currentDate + "\n\n") && !cleaned.startsWith(currentDate + "\n")) {
                // Remove the date temporarily, then add it back with proper spacing
                String afterDate = cleaned.substring(currentDate.length()).trim();
                cleaned = currentDate + "\n\n" + afterDate;
            } else if (cleaned.startsWith(currentDate + "\n")) {
                // If only one newline, add another
                cleaned = currentDate + "\n\n" + cleaned.substring(currentDate.length() + 1).trim();
            }
        } else {
            // No date found, prepend the current date
            cleaned = currentDate + "\n\n" + coverLetter.trim();
        }
        
        // Remove any duplicate blank lines (more than 2 consecutive newlines)
        cleaned = cleaned.replaceAll("\n{3,}", "\n\n");
        
        // Remove any duplicate text after the signature
        // Find "Sincerely," followed by the student's name
        String studentName = student.getFirstName() + " " + student.getLastName();
        String signaturePattern = "Sincerely,\\s*\n\\s*" + Pattern.quote(studentName);
        
        Pattern sigPattern = Pattern.compile(signaturePattern);
        Matcher sigMatcher = sigPattern.matcher(cleaned);
        
        if (sigMatcher.find()) {
            // Find the end of the student's name
            int signatureEndIndex = sigMatcher.end();
            
            // Check if there's any text after the signature (excluding whitespace)
            if (signatureEndIndex < cleaned.length()) {
                String afterSignature = cleaned.substring(signatureEndIndex).trim();
                
                // If there's substantial text after the signature (more than just whitespace), remove it
                if (!afterSignature.isEmpty()) {
                    System.out.println("WARNING: Removing duplicate content after signature: " + afterSignature);
                    cleaned = cleaned.substring(0, signatureEndIndex).trim();
                }
            }
        }
        
        return cleaned;
    }
    
    /**
     * Generates a basic cover letter template when Gemini API is unavailable
     */
    private String generateBasicCoverLetter(StudentProfile student, Job job, CV cv) {
        StringBuilder coverLetter = new StringBuilder();
        
        // Current date in Philippine Standard Time (UTC+8)
        ZonedDateTime philippineTime = ZonedDateTime.now(ZoneId.of("Asia/Manila"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        coverLetter.append(philippineTime.format(formatter)).append("\n\n");
        
        // Greeting - use employer contact person name or company name
        String employerContactPersonName = job.getEmployer().getContactPersonName();
        if (employerContactPersonName != null && !employerContactPersonName.trim().isEmpty()) {
            coverLetter.append("Dear ").append(employerContactPersonName).append(",\n\n");
        } else {
            coverLetter.append("Dear Hiring Manager at ").append(job.getEmployer().getCompanyName()).append(",\n\n");
        }
        
        // Opening paragraph - Introduction
        coverLetter.append("I am writing to express my strong interest in the ").append(job.getTitle())
                  .append(" position at ").append(job.getEmployer().getCompanyName())
                  .append(". As a ").append(student.getMajor() != null ? student.getMajor() : "student")
                  .append(" student at ").append(student.getUniversity() != null ? student.getUniversity() : "my university");
        
        if (student.getGraduationYear() != null) {
            coverLetter.append(" graduating in ").append(student.getGraduationYear());
        }
        
        coverLetter.append(", I am confident that my technical skills and practical experience align well with the requirements of this role.\n\n");
        
        // Body paragraph 1 - Skills and experience match
        List<String> studentSkills = parseSkills(student.getSkills());
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        List<String> matchingSkills = new ArrayList<>(studentSkills);
        matchingSkills.retainAll(jobSkills);
        
        if (!matchingSkills.isEmpty()) {
            coverLetter.append("My technical proficiency in ")
                      .append(String.join(", ", matchingSkills))
                      .append(" directly matches your requirements. ");
        } else if (!studentSkills.isEmpty()) {
            coverLetter.append("Throughout my studies, I have developed strong competencies in ")
                      .append(String.join(", ", studentSkills.subList(0, Math.min(3, studentSkills.size()))))
                      .append(". ");
        }
        
        // Mention relevant experience
        if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
            WorkExperience firstExp = cv.getExperiences().iterator().next();
            coverLetter.append("In my role as ").append(firstExp.getTitle())
                      .append(" at ").append(firstExp.getCompany())
                      .append(", I successfully applied these skills to deliver practical solutions and contribute to project objectives. ");
        } else {
            coverLetter.append("Through various academic projects and coursework, I have gained hands-on experience applying these technologies to solve real-world problems. ");
        }
        
        coverLetter.append("This experience has equipped me with both the technical capabilities and professional mindset needed to excel in this position.\n\n");
        
        // Body paragraph 2 - Additional qualifications
        coverLetter.append("Beyond my core technical skills, ");
        
        // Mention certifications if available
        if (cv.getCertifications() != null && !cv.getCertifications().isEmpty()) {
            Certification firstCert = cv.getCertifications().iterator().next();
            coverLetter.append("I have earned certifications including ")
                      .append(firstCert.getName())
                      .append(", demonstrating my commitment to continuous learning and professional development. ");
        } else {
            coverLetter.append("I am committed to continuous learning and staying current with industry best practices and emerging technologies. ");
        }
        
        coverLetter.append("I am eager to bring my technical expertise, problem-solving abilities, and enthusiasm for ")
                  .append(job.getEmployer().getIndustry() != null ? job.getEmployer().getIndustry() : "technology")
                  .append(" to your team at ").append(job.getEmployer().getCompanyName()).append(".\n\n");
        
        // Closing paragraph
        coverLetter.append("I have attached my CV for your review and would welcome the opportunity to discuss how my qualifications align with your needs. ")
                  .append("Thank you for considering my application. I look forward to the possibility of contributing to your team.\n\n");
        
        // Sign-off
        coverLetter.append("Sincerely,\n")
                  .append(student.getFirstName()).append(" ").append(student.getLastName());
        
        return coverLetter.toString();
    }
    
    /**
     * Parses skills from a comma-separated or JSON array string
     */
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
            String trimmedSkill = skill.trim();
            if (!trimmedSkill.isEmpty()) {
                skillsList.add(trimmedSkill);
            }
        }
        
        return skillsList;
    }
    
    private void logGeminiApiError(String analysisType, Exception e) {
        System.err.println("ERROR: Failed to call Gemini API for " + analysisType + " generation");
        System.err.println("Exception: " + e.getMessage());
        e.printStackTrace();
        System.err.println("Falling back to basic cover letter generation");
    }
    
    private void logGeminiApiResponseError(String analysisType, Map<String, Object> response) {
        System.err.println("ERROR: Unexpected Gemini API response for " + analysisType + " generation");
        System.err.println("Response structure: " + response);
        
        // Check for error details in the response
        if (response != null) {
            if (response.containsKey("error")) {
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                System.err.println("Error code: " + error.getOrDefault("code", "unknown"));
                System.err.println("Error message: " + error.getOrDefault("message", "No message provided"));
                System.err.println("Error status: " + error.getOrDefault("status", "unknown"));
            } else if (response.containsKey("promptFeedback")) {
                Map<String, Object> feedback = (Map<String, Object>) response.get("promptFeedback");
                System.err.println("Prompt feedback: " + feedback);
            }
        }
        
        System.err.println("Falling back to basic cover letter generation");
    }
    
    private void logGeminiApiMissingKeyError(String analysisType) {
        System.err.println("ERROR: Gemini API key is not configured for " + analysisType);
        System.err.println("Please add gemini.api.key to your application.properties");
        System.err.println("Falling back to basic cover letter generation");
    }
} 