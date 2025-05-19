package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @NotBlank
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String location; // e.g., "Manila, Philippines", "Remote"

    @NotBlank
    private String jobType; // e.g., "Full-time", "Part-time", "Internship"

    private String salaryRange; // e.g., "PHP 20,000 - PHP 30,000", "Competitive"
    
    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN; // Default status is OPEN

    @Column(name = "application_deadline")
    private LocalDateTime applicationDeadline;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skillsRequired;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_required_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_preferred_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> preferredSkills;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_profile_id", nullable = false)
    private Profile employer; // The profile (employer) who posted this job

    // Consider adding a direct link to EmployerProfile if frequently needed
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "employer_profile_id") 
    // private EmployerProfile employerProfile;

    private boolean isActive = true; // For soft delete or deactivation
    private LocalDateTime postedDate;
    private LocalDateTime closingDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (postedDate == null) {
            postedDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Job() {}

    public Job(UUID id, String title, String description, String location, String jobType, String salaryRange, List<String> skillsRequired, Profile employer, boolean isActive, LocalDateTime postedDate, LocalDateTime closingDate, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.jobType = jobType;
        this.salaryRange = salaryRange;
        this.skillsRequired = skillsRequired;
        this.employer = employer;
        this.isActive = isActive;
        this.postedDate = postedDate;
        this.closingDate = closingDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Full constructor with all fields including the new ones
    public Job(UUID id, String title, String description, String location, String jobType, String salaryRange, List<String> skillsRequired, List<String> requiredSkills, List<String> preferredSkills, Profile employer, boolean isActive, LocalDateTime postedDate, LocalDateTime closingDate, LocalDateTime createdAt, LocalDateTime updatedAt, JobStatus status, LocalDateTime applicationDeadline) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.jobType = jobType;
        this.salaryRange = salaryRange;
        this.skillsRequired = skillsRequired;
        this.requiredSkills = requiredSkills;
        this.preferredSkills = preferredSkills;
        this.employer = employer;
        this.isActive = isActive;
        this.postedDate = postedDate;
        this.closingDate = closingDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.applicationDeadline = applicationDeadline;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }
    public Profile getEmployer() { return employer; }
    public void setEmployer(Profile employer) { this.employer = employer; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }
    public LocalDateTime getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDateTime closingDate) { this.closingDate = closingDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // New getters and setters for the new fields
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    
    public LocalDateTime getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDateTime applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    
    public List<String> getRequiredSkills() { 
        return requiredSkills != null ? requiredSkills : skillsRequired; // Fallback to skillsRequired if null
    }
    
    public void setRequiredSkills(List<String> requiredSkills) { 
        this.requiredSkills = requiredSkills; 
    }
    
    public List<String> getPreferredSkills() { 
        return preferredSkills; 
    }
    
    public void setPreferredSkills(List<String> preferredSkills) { 
        this.preferredSkills = preferredSkills; 
    }

    // Builder
    public static JobBuilder builder() {
        return new JobBuilder();
    }

    public static class JobBuilder {
        private UUID id;
        private String title;
        private String description;
        private String location;
        private String jobType;
        private String salaryRange;
        private List<String> skillsRequired;
        private List<String> requiredSkills;
        private List<String> preferredSkills;
        private Profile employer;
        private boolean isActive = true;
        private LocalDateTime postedDate;
        private LocalDateTime closingDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private JobStatus status = JobStatus.OPEN;
        private LocalDateTime applicationDeadline;

        JobBuilder() {
        }

        public JobBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public JobBuilder title(String title) {
            this.title = title;
            return this;
        }

        public JobBuilder description(String description) {
            this.description = description;
            return this;
        }

        public JobBuilder location(String location) {
            this.location = location;
            return this;
        }

        public JobBuilder jobType(String jobType) {
            this.jobType = jobType;
            return this;
        }

        public JobBuilder salaryRange(String salaryRange) {
            this.salaryRange = salaryRange;
            return this;
        }

        public JobBuilder skillsRequired(List<String> skillsRequired) {
            this.skillsRequired = skillsRequired;
            return this;
        }

        public JobBuilder employer(Profile employer) {
            this.employer = employer;
            return this;
        }

        public JobBuilder isActive(boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public JobBuilder postedDate(LocalDateTime postedDate) {
            this.postedDate = postedDate;
            return this;
        }

        public JobBuilder closingDate(LocalDateTime closingDate) {
            this.closingDate = closingDate;
            return this;
        }

        public JobBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public JobBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public JobBuilder requiredSkills(List<String> requiredSkills) {
            this.requiredSkills = requiredSkills;
            return this;
        }
        
        public JobBuilder preferredSkills(List<String> preferredSkills) {
            this.preferredSkills = preferredSkills;
            return this;
        }

        public JobBuilder status(JobStatus status) {
            this.status = status;
            return this;
        }

        public JobBuilder applicationDeadline(LocalDateTime applicationDeadline) {
            this.applicationDeadline = applicationDeadline;
            return this;
        }

        public Job build() {
            return new Job(id, title, description, location, jobType, salaryRange, skillsRequired, requiredSkills, preferredSkills, employer, isActive, postedDate, closingDate, createdAt, updatedAt, status, applicationDeadline);
        }

        public String toString() {
            return "Job.JobBuilder(id=" + this.id + ", title=" + this.title + ", description=" + this.description + ", location=" + this.location + ", jobType=" + this.jobType + ", salaryRange=" + this.salaryRange + ", skillsRequired=" + this.skillsRequired + ", requiredSkills=" + this.requiredSkills + ", preferredSkills=" + this.preferredSkills + ", employer=" + (this.employer != null ? this.employer.getId() : null) + ", isActive=" + this.isActive + ", postedDate=" + this.postedDate + ", closingDate=" + this.closingDate + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ", status=" + this.status + ", applicationDeadline=" + this.applicationDeadline + ")";
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Job job = (Job) o;
        return isActive == job.isActive &&
               java.util.Objects.equals(id, job.id) &&
               java.util.Objects.equals(title, job.title) &&
               java.util.Objects.equals(description, job.description) &&
               java.util.Objects.equals(location, job.location) &&
               java.util.Objects.equals(jobType, job.jobType) &&
               java.util.Objects.equals(salaryRange, job.salaryRange) &&
               java.util.Objects.equals(skillsRequired, job.skillsRequired) &&
               java.util.Objects.equals(requiredSkills, job.requiredSkills) &&
               java.util.Objects.equals(preferredSkills, job.preferredSkills) &&
               java.util.Objects.equals(employer != null ? employer.getId() : null, job.employer != null ? job.employer.getId() : null) && // Compare by User ID
               java.util.Objects.equals(postedDate, job.postedDate) &&
               java.util.Objects.equals(closingDate, job.closingDate) &&
               java.util.Objects.equals(createdAt, job.createdAt) &&
               java.util.Objects.equals(updatedAt, job.updatedAt) &&
               java.util.Objects.equals(status, job.status) &&
               java.util.Objects.equals(applicationDeadline, job.applicationDeadline);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id, title, description, location, jobType, salaryRange, 
                                      skillsRequired, requiredSkills, preferredSkills,
                                      employer != null ? employer.getId() : null, // Hash by User ID
                                      isActive, postedDate, closingDate, createdAt, updatedAt, status, applicationDeadline);
    }

    @Override
    public String toString() {
        return "Job{" +
               "id=" + id +
               ", title='" + title + '\'' +
               ", description='" + description + '\'' +
               ", location='" + location + '\'' +
               ", jobType='" + jobType + '\'' +
               ", salaryRange='" + salaryRange + '\'' +
               ", skillsRequired=" + skillsRequired +
               ", requiredSkills=" + requiredSkills +
               ", preferredSkills=" + preferredSkills +
               ", employerId=" + (employer != null ? employer.getId() : null) + // Display User ID
               ", isActive=" + isActive +
               ", postedDate=" + postedDate +
               ", closingDate=" + closingDate +
               ", createdAt=" + createdAt +
               ", updatedAt=" + updatedAt +
               ", status=" + status +
               ", applicationDeadline=" + applicationDeadline +
               '}';
    }
} 