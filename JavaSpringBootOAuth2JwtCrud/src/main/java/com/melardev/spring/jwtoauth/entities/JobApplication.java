package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplication extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;
    
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnore
    private Job job;
    
    @ManyToOne
    @JoinColumn(name = "cv_id", nullable = false)
    @JsonIgnore
    private CV cv;
    
    @Column(name = "cover_letter", length = 2000)
    private String coverLetter;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
    
    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;
    
    @Column(name = "feedback", length = 1000)
    private String feedback;
    
    public JobApplication() {
        appliedAt = LocalDateTime.now();
        lastUpdatedAt = LocalDateTime.now();
    }
    
    public StudentProfile getStudent() {
        return student;
    }
    
    public void setStudent(StudentProfile student) {
        this.student = student;
    }
    
    public Job getJob() {
        return job;
    }
    
    public void setJob(Job job) {
        this.job = job;
    }
    
    public CV getCv() {
        return cv;
    }
    
    public void setCv(CV cv) {
        this.cv = cv;
    }
    
    public String getCoverLetter() {
        return coverLetter;
    }
    
    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }
    
    public ApplicationStatus getStatus() {
        return status;
    }
    
    public void setStatus(ApplicationStatus status) {
        this.status = status;
        this.lastUpdatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }
    
    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
    
    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }
    
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
} 