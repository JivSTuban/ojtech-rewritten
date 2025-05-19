package com.ojtech.api.payload.response;

import com.ojtech.api.model.Job;
import com.ojtech.api.model.EmployerProfile; // Assuming EmployerProfile exists and is relevant
import com.ojtech.api.model.Profile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID; // Import UUID

// This DTO is for the public job detail view
public class JobDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private String location;
    private String jobType;
    private String salaryRange;
    private List<String> skillsRequired;
    private boolean isActive;
    private LocalDateTime postedDate;
    private LocalDateTime closingDate;
    private EmployerInfo employer;

    // Inner class for Employer details
    public static class EmployerInfo {
        private UUID id; // User ID of the employer, Changed to UUID
        private String username; // Employer's username
        private EmployerProfileInfo employerProfile; // Nested profile DTO

        public EmployerInfo(UUID id, String username, EmployerProfileInfo employerProfile) { // Changed to UUID
            this.id = id;
            this.username = username;
            this.employerProfile = employerProfile;
        }
        // Getters
        public UUID getId() { return id; } // Changed to UUID
        public String getUsername() { return username; }
        public EmployerProfileInfo getEmployerProfile() { return employerProfile; }
    }
    
    // Inner class for Employer Profile details needed in job view
    public static class EmployerProfileInfo {
        private String companyName;
        private String companyLogoUrl;
        private String companyDescription;
        private String industry;
        private String companyWebsite;

        public EmployerProfileInfo(String companyName, String companyLogoUrl, String companyDescription, String industry, String companyWebsite) {
            this.companyName = companyName;
            this.companyLogoUrl = companyLogoUrl;
            this.companyDescription = companyDescription;
            this.industry = industry;
            this.companyWebsite = companyWebsite;
        }
        // Getters
        public String getCompanyName() { return companyName; }
        public String getCompanyLogoUrl() { return companyLogoUrl; }
        public String getCompanyDescription() { return companyDescription; }
        public String getIndustry() { return industry; }
        public String getCompanyWebsite() { return companyWebsite; }
    }

    // Constructor to map from Job entity and EmployerProfile entity
    public JobDetailResponse(Job job, EmployerProfile employerProfile) {
        this.id = job.getId();
        this.title = job.getTitle();
        this.description = job.getDescription();
        this.location = job.getLocation();
        this.jobType = job.getJobType();
        this.salaryRange = job.getSalaryRange();
        this.skillsRequired = job.getSkillsRequired();
        this.isActive = job.isActive();
        this.postedDate = job.getPostedDate();
        this.closingDate = job.getClosingDate();

        // Create employer info from profile
        Profile profile = job.getEmployer();
        EmployerProfileInfo profileInfo = null;
        
        if (employerProfile != null) {
            profileInfo = new EmployerProfileInfo(
                employerProfile.getCompanyName(),
                employerProfile.getCompanyLogoUrl(),
                employerProfile.getCompanyDescription(),
                employerProfile.getIndustry(),
                employerProfile.getCompanyWebsite()
            );
        }
        
        this.employer = new EmployerInfo(profile.getId(), profile.getUsername(), profileInfo);
    }

    // Getters for JobDetailResponse
    public UUID getId() { return id; } // Changed to UUID
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public String getJobType() { return jobType; }
    public String getSalaryRange() { return salaryRange; }
    public List<String> getSkillsRequired() { return skillsRequired; }
    public boolean isActive() { return isActive; }
    public LocalDateTime getPostedDate() { return postedDate; }
    public LocalDateTime getClosingDate() { return closingDate; }
    public EmployerInfo getEmployer() { return employer; }
} 