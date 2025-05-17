package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    private String title;

    @NotNull
    private String description;

    @NotNull
    private String companyName;

    private String companyLogoUrl;

    @NotNull
    private String location;

    @NotNull
    @Enumerated(EnumType.STRING)
    private JobType jobType;

    private String salaryRange;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    @NotNull
    private Profile employer;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN;

    private OffsetDateTime applicationDeadline;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @Column(columnDefinition = "jsonb")
    private String requiredSkills;

    @Column(columnDefinition = "jsonb")
    private String preferredSkills;
    
    public Job() {
    }
    
    public Job(UUID id, String title, String description, String companyName, String companyLogoUrl,
               String location, JobType jobType, String salaryRange, Profile employer, JobStatus status,
               OffsetDateTime applicationDeadline, OffsetDateTime createdAt, OffsetDateTime updatedAt,
               String requiredSkills, String preferredSkills) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.companyName = companyName;
        this.companyLogoUrl = companyLogoUrl;
        this.location = location;
        this.jobType = jobType;
        this.salaryRange = salaryRange;
        this.employer = employer;
        this.status = status;
        this.applicationDeadline = applicationDeadline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.requiredSkills = requiredSkills;
        this.preferredSkills = preferredSkills;
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }
    
    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public JobType getJobType() {
        return jobType;
    }
    
    public void setJobType(JobType jobType) {
        this.jobType = jobType;
    }
    
    public String getSalaryRange() {
        return salaryRange;
    }
    
    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }
    
    public Profile getEmployer() {
        return employer;
    }
    
    public void setEmployer(Profile employer) {
        this.employer = employer;
    }
    
    public JobStatus getStatus() {
        return status;
    }
    
    public void setStatus(JobStatus status) {
        this.status = status;
    }
    
    public OffsetDateTime getApplicationDeadline() {
        return applicationDeadline;
    }
    
    public void setApplicationDeadline(OffsetDateTime applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getRequiredSkills() {
        return requiredSkills;
    }
    
    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
    
    public String getPreferredSkills() {
        return preferredSkills;
    }
    
    public void setPreferredSkills(String preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    // Explicit builder static method in case Lombok fails
    public static JobBuilder builder() {
        return new JobBuilder();
    }
    
    // Explicit builder class implementation
    public static class JobBuilder {
        private UUID id;
        private String title;
        private String description;
        private String companyName;
        private String companyLogoUrl;
        private String location;
        private JobType jobType;
        private String salaryRange;
        private Profile employer;
        private JobStatus status = JobStatus.OPEN;
        private OffsetDateTime applicationDeadline;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private String requiredSkills;
        private String preferredSkills;
        
        JobBuilder() {}
        
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
        
        public JobBuilder companyName(String companyName) {
            this.companyName = companyName;
            return this;
        }
        
        public JobBuilder companyLogoUrl(String companyLogoUrl) {
            this.companyLogoUrl = companyLogoUrl;
            return this;
        }
        
        public JobBuilder location(String location) {
            this.location = location;
            return this;
        }
        
        public JobBuilder jobType(JobType jobType) {
            this.jobType = jobType;
            return this;
        }
        
        public JobBuilder salaryRange(String salaryRange) {
            this.salaryRange = salaryRange;
            return this;
        }
        
        public JobBuilder employer(Profile employer) {
            this.employer = employer;
            return this;
        }
        
        public JobBuilder status(JobStatus status) {
            this.status = status;
            return this;
        }
        
        public JobBuilder applicationDeadline(OffsetDateTime applicationDeadline) {
            this.applicationDeadline = applicationDeadline;
            return this;
        }
        
        public JobBuilder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public JobBuilder updatedAt(OffsetDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public JobBuilder requiredSkills(String requiredSkills) {
            this.requiredSkills = requiredSkills;
            return this;
        }
        
        public JobBuilder preferredSkills(String preferredSkills) {
            this.preferredSkills = preferredSkills;
            return this;
        }
        
        public Job build() {
            return new Job(id, title, description, companyName, companyLogoUrl,
                           location, jobType, salaryRange, employer, status,
                           applicationDeadline, createdAt, updatedAt,
                           requiredSkills, preferredSkills);
        }
    }
} 