package com.melardev.spring.jwtoauth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiApiUrl;

    @Value("${gemini.api.key:AIzaSyCcmhTwEX5tZqPMQnR_gZOMBuoP8HJbe7k}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.5-flash-preview-05-20}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        
        // Log configuration at startup
        System.out.println("GeminiService initialized with API URL: " + geminiApiUrl);
        System.out.println("GeminiService using model: " + model);
    }

    @PostConstruct
    public void init() {
        // Validate API key at startup
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            System.err.println("WARNING: Gemini API key is not properly configured. Set the GEMINI_API_KEY environment variable or update application.properties.");
        }
    }

    public String generateResumeContent(Map<String, Object> profileData) {
        String prompt = createCVPrompt(profileData);
        
        System.out.println("GeminiService - Generating resume content with API URL: " + geminiApiUrl);
        System.out.println("GeminiService - Using model: " + model);
        System.out.println("GeminiService - API key length: " + (geminiApiKey != null ? geminiApiKey.length() : "null"));
        
        // Validate API key
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            throw new RuntimeException("Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable or update application.properties.");
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));
        
        // Generation config - optimized for resume content
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.6);  // Slightly lower temperature for more focused content
        generationConfig.put("topK", 40);
        generationConfig.put("topP", 0.9);
        generationConfig.put("maxOutputTokens", 2048);
        requestBody.put("generationConfig", generationConfig);
        
        // Safety settings
        List<Map<String, String>> safetySettings = List.of(
            Map.of(
                "category", "HARM_CATEGORY_HARASSMENT",
                "threshold", "BLOCK_MEDIUM_AND_ABOVE"
            ),
            Map.of(
                "category", "HARM_CATEGORY_HATE_SPEECH",
                "threshold", "BLOCK_MEDIUM_AND_ABOVE"
            ),
            Map.of(
                "category", "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold", "BLOCK_MEDIUM_AND_ABOVE"
            ),
            Map.of(
                "category", "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold", "BLOCK_MEDIUM_AND_ABOVE"
            )
        );
        requestBody.put("safetySettings", safetySettings);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = String.format("%s/models/%s:generateContent?key=%s", geminiApiUrl, model, geminiApiKey);
        System.out.println("GeminiService - Full API URL: " + url);
        
        try {
            System.out.println("GeminiService - Sending request to Gemini API");
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Log the request body (sanitized to avoid logging the API key)
            try {
                String requestBodyJson = objectMapper.writeValueAsString(requestBody);
                System.out.println("GeminiService - Request body: " + requestBodyJson);
            } catch (Exception e) {
                System.out.println("GeminiService - Failed to log request body: " + e.getMessage());
            }
            
            // Add timeout to the request
            Map<String, Object> response;
            try {
                System.out.println("GeminiService - Sending API request at: " + System.currentTimeMillis());
                response = restTemplate.postForObject(url, request, Map.class);
                System.out.println("GeminiService - Received API response at: " + System.currentTimeMillis());
            } catch (Exception e) {
                System.out.println("GeminiService - Error calling Gemini API: " + e.getMessage());
                e.printStackTrace();
                // Return a simple JSON response as fallback
                return createFallbackResponse(profileData);
            }
            
            System.out.println("GeminiService - Received response from Gemini API: " + (response != null ? "not null" : "null"));
            
            // Log the raw response
            try {
                if (response != null) {
                    String responseJson = objectMapper.writeValueAsString(response);
                    System.out.println("GeminiService - Raw API Response: " + responseJson);
                }
            } catch (Exception e) {
                System.out.println("GeminiService - Failed to log raw response: " + e.getMessage());
            }
            
            if (response == null) {
                System.out.println("GeminiService - Null response from Gemini API");
                return createFallbackResponse(profileData);
            }
            
            if (response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                System.out.println("GeminiService - Number of candidates: " + candidates.size());
                
                if (!candidates.isEmpty()) {
                    // Log the first candidate details
                    Map<String, Object> firstCandidate = candidates.get(0);
                    System.out.println("GeminiService - First candidate keys: " + firstCandidate.keySet());
                    
                    if (firstCandidate.containsKey("finishReason")) {
                        System.out.println("GeminiService - Finish reason: " + firstCandidate.get("finishReason"));
                    }
                    
                    if (firstCandidate.containsKey("safetyRatings")) {
                        System.out.println("GeminiService - Safety ratings: " + firstCandidate.get("safetyRatings"));
                    }
                    
                    Map<String, Object> content1 = (Map<String, Object>) candidates.get(0).get("content");
                    if (content1 != null && content1.containsKey("parts")) {
                        System.out.println("GeminiService - Content keys: " + content1.keySet());
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content1.get("parts");
                        
                        System.out.println("GeminiService - Number of content parts: " + parts.size());
                        
                        if (!parts.isEmpty()) {
                            Map<String, Object> firstPart = parts.get(0);
                            System.out.println("GeminiService - First part keys: " + firstPart.keySet());
                            
                            String generatedText = (String) firstPart.get("text");
                            if (generatedText != null && !generatedText.isEmpty()) {
                                System.out.println("GeminiService - Generated text length: " + generatedText.length());
                                System.out.println("GeminiService - Generated text preview: " + 
                                    (generatedText.length() > 500 ? 
                                        generatedText.substring(0, 500) + "..." : 
                                        generatedText));
                                
                                String cleanedJson = cleanAndParseJson(generatedText);
                                System.out.println("GeminiService - Cleaned JSON length: " + cleanedJson.length());
                                System.out.println("GeminiService - Cleaned JSON preview: " + 
                                    (cleanedJson.length() > 200 ? 
                                        cleanedJson.substring(0, 200) + "..." : 
                                        cleanedJson));
                                        
                                return cleanedJson;
                            } else {
                                System.out.println("GeminiService - Generated text is null or empty");
                            }
                        } else {
                            System.out.println("GeminiService - Content parts list is empty");
                        }
                    } else {
                        System.out.println("GeminiService - Content is null or doesn't contain parts");
                    }
                } else {
                    System.out.println("GeminiService - Candidates list is empty");
                }
            } else if (response.containsKey("error")) {
                // Handle error response from Gemini API
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                System.out.println("GeminiService - Error from Gemini API: " + error);
                
                if (error.containsKey("code")) {
                    System.out.println("GeminiService - Error code: " + error.get("code"));
                }
                
                if (error.containsKey("message")) {
                    String errorMessage = (String) error.get("message");
                    System.out.println("GeminiService - Error message: " + errorMessage);
                }
                
                if (error.containsKey("status")) {
                    System.out.println("GeminiService - Error status: " + error.get("status"));
                }
                
                if (error.containsKey("details")) {
                    System.out.println("GeminiService - Error details: " + error.get("details"));
                }
            } else {
                System.out.println("GeminiService - Response doesn't contain candidates or error. Keys: " + response.keySet());
            }
            
            System.out.println("GeminiService - Invalid response format or empty content, using fallback");
            return createFallbackResponse(profileData);
            
        } catch (Exception e) {
            System.out.println("GeminiService - Exception: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return createFallbackResponse(profileData);
        }
    }

    private String cleanAndParseJson(String jsonStr) {
        System.out.println("GeminiService - Cleaning and parsing JSON string of length: " + (jsonStr != null ? jsonStr.length() : "null"));
        
        if (jsonStr == null || jsonStr.trim().isEmpty()) {
            System.out.println("GeminiService - Empty or null JSON string received");
            throw new RuntimeException("Empty JSON string received from AI");
        }

        // Check if the input contains markdown code block markers
        boolean hasCodeBlockMarkers = jsonStr.contains("```json") || jsonStr.contains("```");
        if (hasCodeBlockMarkers) {
            System.out.println("GeminiService - JSON string contains code block markers, removing them");
        }
        
        // Remove code block markers
        String cleaned = jsonStr.replaceAll("```json\\n?|\\n?```", "")
            .replaceAll(",\\s*}", "}")  // Remove trailing commas
            .replaceAll(",\\s*]", "]")  // Remove trailing commas in arrays
            .trim();
        
        System.out.println("GeminiService - After initial cleanup, JSON length: " + cleaned.length());
        
        try {
            // Validate JSON by parsing and re-serializing
            System.out.println("GeminiService - Attempting to parse JSON");
            Object json = objectMapper.readValue(cleaned, Object.class);
            System.out.println("GeminiService - Successfully parsed JSON, class: " + (json != null ? json.getClass().getName() : "null"));
            
            if (json instanceof Map) {
                System.out.println("GeminiService - JSON is a Map with keys: " + ((Map<?, ?>) json).keySet());
            } else if (json instanceof List) {
                System.out.println("GeminiService - JSON is a List with size: " + ((List<?>) json).size());
            }
            
            String formattedJson = objectMapper.writeValueAsString(json);
            System.out.println("GeminiService - Re-serialized JSON, length: " + formattedJson.length());
            return formattedJson;
        } catch (Exception e) {
            // Log the error and problematic JSON
            System.out.println("GeminiService - First JSON parsing attempt failed: " + e.getMessage());
            System.out.println("GeminiService - Problematic JSON preview: " + 
                (cleaned.length() > 500 ? cleaned.substring(0, 500) + "..." : cleaned));
            
            // If parsing fails, try additional cleanup
            System.out.println("GeminiService - Attempting additional cleanup");
            cleaned = cleaned
                .replaceAll("\\n", "")  // Remove all newlines
                .replaceAll("\\s+", " ")  // Normalize whitespace
                .replaceAll("([{[,:])\s+", "$1")  // Remove spaces after structural characters
                .replaceAll("\\s+([}\\],:])", "$1")  // Remove spaces before structural characters
                .replaceAll("([a-zA-Z0-9\"])\s+:", "$1:")  // Remove spaces before colons
                .replaceAll(":\\s+([{\\[\"'])", ":$1");  // Remove spaces after colons before values
            
            System.out.println("GeminiService - After additional cleanup, JSON length: " + cleaned.length());
            
            try {
                System.out.println("GeminiService - Attempting to parse JSON with additional cleanup");
                Object json = objectMapper.readValue(cleaned, Object.class);
                System.out.println("GeminiService - Successfully parsed JSON after additional cleanup");
                String formattedJson = objectMapper.writeValueAsString(json);
                System.out.println("GeminiService - Re-serialized JSON, length: " + formattedJson.length());
                return formattedJson;
            } catch (Exception e2) {
                System.out.println("GeminiService - Second JSON parsing attempt failed: " + e2.getMessage());
                
                // Try to extract JSON from text - look for first { and last }
                try {
                    System.out.println("GeminiService - Attempting to extract JSON from text");
                    int startIdx = jsonStr.indexOf('{');
                    int endIdx = jsonStr.lastIndexOf('}') + 1;
                    
                    if (startIdx >= 0 && endIdx > startIdx) {
                        String extractedJson = jsonStr.substring(startIdx, endIdx);
                        System.out.println("GeminiService - Extracted potential JSON, length: " + extractedJson.length());
                        
                        // Try to parse the extracted JSON
                        Object json = objectMapper.readValue(extractedJson, Object.class);
                        System.out.println("GeminiService - Successfully parsed extracted JSON");
                        String formattedJson = objectMapper.writeValueAsString(json);
                        return formattedJson;
                    } else {
                        System.out.println("GeminiService - No JSON structure detected in text");
                    }
                } catch (Exception e3) {
                    System.out.println("GeminiService - JSON extraction failed: " + e3.getMessage());
                }
                
                // If all attempts fail, throw the exception
                throw new RuntimeException("Failed to parse resume data from AI response", e2);
            }
        }
    }

    private String createCVPrompt(Map<String, Object> profileData) {
        // Extract data with null safety
        String firstName = (String) profileData.getOrDefault("firstName", "");
        String lastName = (String) profileData.getOrDefault("lastName", "");
        String email = (String) profileData.getOrDefault("email", "");
        String phoneNumber = (String) profileData.getOrDefault("phoneNumber", "");
        String location = (String) profileData.getOrDefault("location", "");
        String address = (String) profileData.getOrDefault("address", "");
        String university = (String) profileData.getOrDefault("university", "");
        String major = (String) profileData.getOrDefault("major", "");
        String graduationYear = String.valueOf(profileData.getOrDefault("graduationYear", ""));
        String bio = (String) profileData.getOrDefault("bio", "");
        String githubUrl = (String) profileData.getOrDefault("githubUrl", "");
        String linkedinUrl = (String) profileData.getOrDefault("linkedinUrl", "");
        String portfolioUrl = (String) profileData.getOrDefault("portfolioUrl", "");
        
        // Format collections
        String skillsStr = formatSkills(profileData.get("skills"));
        String experiencesStr = formatExperiences(profileData.get("experiences"));
        String certificationsStr = formatCertifications(profileData.get("certifications"));
        String projectsStr = formatProjects(profileData.get("githubProjects"));
        
        return String.format("""
            Format the following resume information into optimized content for an ATS-friendly resume. DO NOT create any HTML - just return a JSON object with the formatted content.
            Focus on creating impactful bullet points and quantifying achievements.
            
            STUDENT INFORMATION:
            -------------------
            Full Name: %s %s
            Email: %s
            Phone: %s
            Location: %s
            Address: %s
            
            Education:
            University: %s
            Major: %s
            Graduation Year: %s
            
            Skills: %s
            
            Work Experience:
            %s
            
            Certifications:
            %s
            
            Projects:
            %s
            
            Bio/Summary:
            %s
            
            Online Presence:
            GitHub: %s
            LinkedIn: %s
            Portfolio: %s
            
            REQUIREMENTS:
            ------------
            1. Return a JSON object with the following structure:
               {
                 "professionalSummary": {
                   "summaryPoints": ["point1", "point2", "point3"]  // 3-4 bullet points
                 },
                 "skills": {
                   "skillsList": ["skill1", "skill2", ...]  // Categorized and organized skills
                 },
                 "experience": {
                   "experiences": [
                     {
                       "title": "Job Title",
                       "company": "Company Name",
                       "location": "Location",
                       "dateRange": "Date Range",
                       "achievements": ["achievement1", "achievement2", ...]  // 3-4 bullet points per role
                     }
                   ]
                 },
                 "projects": {
                   "projectsList": [
                     {
                       "name": "Project Name",
                       "technologies": "Tech Stack",
                       "highlights": ["highlight1", "highlight2", ...]  // 2-3 bullet points per project
                     }
                   ]
                 },
                 "education": {
                   "university": "University Name",
                   "major": "Major",
                   "graduationYear": "Year",
                   "location": "Location"
                 },
                 "certifications": {
                   "certificationsList": [
                     {
                       "name": "Cert Name",
                       "issuer": "Issuer",
                       "dateReceived": "Date"
                     }
                   ]
                 },
                 "contactInfo": {
                   "name": "Full Name",
                   "email": "Email",
                   "phone": "Phone",
                   "location": "Location",
                   "address": "Address",
                   "linkedin": "LinkedIn URL",
                   "github": "GitHub URL",
                   "portfolio": "Portfolio URL"
                 }
               }
            
            2. For each bullet point:
               - Start with a strong action verb
               - Include specific metrics and numbers
               - Focus on achievements and impact
               - Use the X-Y-Z formula: "Accomplished X, as measured by Y, by doing Z"
            
            3. Professional Summary points should:
               - Highlight key skills and achievements
               - Include relevant industry keywords
               - Focus on value proposition
               - Be concise but impactful
               - Include location information when relevant
            
            4. Format all dates consistently as "MMM YYYY" (e.g., "Jan 2024")
            
            5. Include the location in the contact information section and in the professional summary if relevant
            
            RESPONSE FORMAT:
            --------------
            Return ONLY the JSON object with the formatted content. Do not include any other text or explanation.
            The JSON will be used to populate a pre-defined template, so stick strictly to the specified structure.
            """,
            firstName, lastName, email, phoneNumber, location, address,
            university, major, graduationYear,
            skillsStr, experiencesStr, certificationsStr, projectsStr,
            bio, githubUrl, linkedinUrl, portfolioUrl);
    }

    private String formatSkills(Object skills) {
        if (skills == null) return "";
        if (skills instanceof List) {
            return String.join(", ", ((List<?>) skills).stream().map(Object::toString).toList());
        }
        return skills.toString();
    }

    private String formatExperiences(Object experiences) {
        if (experiences == null) return "No work experience provided";
        if (!(experiences instanceof List)) return "No work experience provided";
        
        List<?> expList = (List<?>) experiences;
        if (expList.isEmpty()) return "No work experience provided";

        StringBuilder sb = new StringBuilder();
        for (Object expObj : expList) {
            if (!(expObj instanceof Map)) continue;
            
            Map<?, ?> exp = (Map<?, ?>) expObj;
            String title = exp.containsKey("title") ? exp.get("title").toString() : "";
            String company = exp.containsKey("company") ? exp.get("company").toString() : "";
            String location = exp.containsKey("location") ? exp.get("location").toString() : "";
            String startDate = exp.containsKey("startDate") ? formatDate(exp.get("startDate").toString()) : "";
            
            boolean current = Boolean.TRUE.equals(exp.get("current"));
            String endDate = current ? "Present" : 
                             exp.containsKey("endDate") ? formatDate(exp.get("endDate").toString()) : "";
            
            String dateRange = startDate + " - " + endDate;
            String description = exp.containsKey("description") ? exp.get("description").toString() : "";
            
            sb.append("\nPosition: ").append(title)
              .append("\nCompany: ").append(company)
              .append("\nLocation: ").append(location)
              .append("\nDates: ").append(dateRange)
              .append("\nDescription: ").append(description)
              .append("\n\n");
        }
        
        return sb.toString().trim();
    }

    private String formatCertifications(Object certifications) {
        if (certifications == null) return "No certifications provided";
        if (!(certifications instanceof List)) return "No certifications provided";
        
        List<?> certList = (List<?>) certifications;
        if (certList.isEmpty()) return "No certifications provided";

        StringBuilder sb = new StringBuilder();
        for (Object certObj : certList) {
            if (!(certObj instanceof Map)) continue;
            
            Map<?, ?> cert = (Map<?, ?>) certObj;
            String name = cert.containsKey("name") ? cert.get("name").toString() : "";
            String issuer = cert.containsKey("issuer") ? cert.get("issuer").toString() : "";
            String dateReceived = cert.containsKey("dateReceived") ? formatDate(cert.get("dateReceived").toString()) : "";
            
            sb.append("\nName: ").append(name)
              .append("\nIssuer: ").append(issuer)
              .append("\nDate: ").append(dateReceived)
              .append("\n\n");
        }
        
        return sb.toString().trim();
    }

    private String formatProjects(Object projects) {
        if (projects == null) return "No projects provided";
        if (!(projects instanceof List)) return "No projects provided";
        
        List<?> projList = (List<?>) projects;
        if (projList.isEmpty()) return "No projects provided";

        StringBuilder sb = new StringBuilder();
        for (Object projObj : projList) {
            if (!(projObj instanceof Map)) continue;
            
            Map<?, ?> proj = (Map<?, ?>) projObj;
            String name = proj.containsKey("name") ? proj.get("name").toString() : "";
            String description = proj.containsKey("description") ? proj.get("description").toString() : "";
            String url = proj.containsKey("url") ? proj.get("url").toString() : "";
            
            // Handle technologies which might be a List or a String
            String technologies = "";
            if (proj.containsKey("technologies")) {
                Object techObj = proj.get("technologies");
                if (techObj instanceof List) {
                    technologies = String.join(", ", ((List<?>) techObj).stream().map(Object::toString).toList());
                } else if (techObj != null) {
                    technologies = techObj.toString();
                }
            }

            sb.append("\nName: ").append(name)
              .append("\nDescription: ").append(description)
              .append("\nTechnologies: ").append(technologies)
              .append("\nURL: ").append(url)
              .append("\n\n");
        }
        
        return sb.toString().trim();
    }

    private String formatDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.isEmpty()) return "";
            
            // Simple formatting - assume dateStr is in a standard format
            return dateStr;
        } catch (Exception e) {
            return dateStr;
        }
    }

    /**
     * Creates a fallback response when the Gemini API fails
     */
    private String createFallbackResponse(Map<String, Object> profileData) {
        try {
            // Extract basic profile information
            String firstName = (String) profileData.getOrDefault("firstName", "");
            String lastName = (String) profileData.getOrDefault("lastName", "");
            String email = (String) profileData.getOrDefault("email", "");
            String phone = (String) profileData.getOrDefault("phoneNumber", "");
            String location = (String) profileData.getOrDefault("location", "");
            String university = (String) profileData.getOrDefault("university", "");
            String major = (String) profileData.getOrDefault("major", "");
            String graduationYear = String.valueOf(profileData.getOrDefault("graduationYear", ""));
            
            // Create a simple JSON response
            Map<String, Object> response = new HashMap<>();
            
            // Contact info
            Map<String, Object> contactInfo = new HashMap<>();
            contactInfo.put("name", firstName + " " + lastName);
            contactInfo.put("email", email);
            contactInfo.put("phone", phone);
            contactInfo.put("location", location);
            contactInfo.put("linkedin", profileData.getOrDefault("linkedinUrl", ""));
            contactInfo.put("github", profileData.getOrDefault("githubUrl", ""));
            contactInfo.put("portfolio", profileData.getOrDefault("portfolioUrl", ""));
            response.put("contactInfo", contactInfo);
            
            // Professional summary
            Map<String, Object> summary = new HashMap<>();
            List<String> summaryPoints = new ArrayList<>();
            summaryPoints.add("Experienced professional with a background in " + major);
            summaryPoints.add("Skilled in various technologies and methodologies");
            summaryPoints.add("Dedicated to delivering high-quality results and continuous improvement");
            summary.put("summaryPoints", summaryPoints);
            response.put("professionalSummary", summary);
            
            // Skills
            Map<String, Object> skills = new HashMap<>();
            Object skillsObj = profileData.get("skills");
            if (skillsObj instanceof List) {
                skills.put("skillsList", skillsObj);
            } else {
                skills.put("skillsList", new ArrayList<>());
            }
            response.put("skills", skills);
            
            // Education
            Map<String, Object> education = new HashMap<>();
            education.put("university", university);
            education.put("major", major);
            education.put("graduationYear", graduationYear);
            education.put("location", location);
            response.put("education", education);
            
            // Return as JSON string
            return objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            System.out.println("Error creating fallback response: " + e.getMessage());
            // Return minimal valid JSON
            return "{\"contactInfo\":{\"name\":\"" + profileData.getOrDefault("firstName", "") + " " + 
                   profileData.getOrDefault("lastName", "") + "\",\"email\":\"" + 
                   profileData.getOrDefault("email", "") + "\"}}";
        }
    }
} 