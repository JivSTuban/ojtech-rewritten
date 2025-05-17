package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
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

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skillsRequired;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_user_id", nullable = false)
    private User employer; // The user (employer) who posted this job

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
    // public Job() {} // Removed due to @NoArgsConstructor

    // Getters and Setters // Removed due to @Data
    // public Long getId() { return id; }
    // public void setId(Long id) { this.id = id; }
    // public String getTitle() { return title; }
    // public void setTitle(String title) { this.title = title; }
    // public String getDescription() { return description; }
    // public void setDescription(String description) { this.description = description; }
    // public String getLocation() { return location; }
    // public void setLocation(String location) { this.location = location; }
    // public String getJobType() { return jobType; }
    // public void setJobType(String jobType) { this.jobType = jobType; }
    // public String getSalaryRange() { return salaryRange; }
    // public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    // public List<String> getSkillsRequired() { return skillsRequired; }
    // public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }
    // public User getEmployer() { return employer; }
    // public void setEmployer(User employer) { this.employer = employer; }
    // public boolean isActive() { return isActive; }
    // public void setActive(boolean active) { isActive = active; }
    // public LocalDateTime getPostedDate() { return postedDate; }
    // public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }
    // public LocalDateTime getClosingDate() { return closingDate; }
    // public void setClosingDate(LocalDateTime closingDate) { this.closingDate = closingDate; }
    // public LocalDateTime getCreatedAt() { return createdAt; }
    // public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    // public LocalDateTime getUpdatedAt() { return updatedAt; }
    // public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 