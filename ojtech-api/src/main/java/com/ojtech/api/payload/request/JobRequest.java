package com.ojtech.api.payload.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public class JobRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    @Size(max = 100)
    private String location;

    @NotBlank
    @Size(max = 50)
    private String jobType; // e.g., Full-time, Part-time, Internship

    @Size(max = 100)
    private String salaryRange;

    @NotEmpty
    private List<String> skillsRequired;

    private LocalDateTime closingDate; // Optional

    private Boolean isActive; // Optional, defaults to true on creation

    // Getters and Setters
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
    public LocalDateTime getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDateTime closingDate) { this.closingDate = closingDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
} 