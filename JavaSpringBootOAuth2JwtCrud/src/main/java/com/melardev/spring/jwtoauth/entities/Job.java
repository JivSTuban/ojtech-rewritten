package com.melardev.spring.jwtoauth.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "employer_id")
    @JsonBackReference
    private EmployerProfile employer;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", length = 5000, nullable = false)
    private String description;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "required_skills")
    private String requiredSkills;
    
    @Column(name = "employment_type")
    private String employmentType;
    
    @Column(name = "min_salary")
    private Double minSalary;
    
    @Column(name = "max_salary")
    private Double maxSalary;
    
    @Column(name = "currency")
    private String currency;
    
    @Column(name = "posted_at")
    private LocalDateTime postedAt;
    
    @Column(name = "active")
    private boolean active = true;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<JobApplication> applications = new ArrayList<>();
    
    public Job() {
    }
    
    public EmployerProfile getEmployer() {
        return employer;
    }
    
    public void setEmployer(EmployerProfile employer) {
        this.employer = employer;
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
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getRequiredSkills() {
        return requiredSkills;
    }
    
    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
    
    public String getEmploymentType() {
        return employmentType;
    }
    
    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }
    
    public Double getMinSalary() {
        return minSalary;
    }
    
    public void setMinSalary(Double minSalary) {
        this.minSalary = minSalary;
    }
    
    public Double getMaxSalary() {
        return maxSalary;
    }
    
    public void setMaxSalary(Double maxSalary) {
        this.maxSalary = maxSalary;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public LocalDateTime getPostedAt() {
        return postedAt;
    }
    
    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public List<JobApplication> getApplications() {
        return applications;
    }
    
    public void setApplications(List<JobApplication> applications) {
        this.applications = applications;
    }
} 