package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @NotNull
    private StudentProfile student;

    @ManyToOne
    @JoinColumn(name = "job_id")
    @NotNull
    private Job job;

    @Min(0)
    @Max(100)
    private BigDecimal matchScore;

    private String status = "pending";

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
    
    // Default constructor
    public Match() {
    }
    
    // All-args constructor
    public Match(UUID id, StudentProfile student, Job job, BigDecimal matchScore, String status, 
                OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.student = student;
        this.job = job;
        this.matchScore = matchScore;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
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
    
    public BigDecimal getMatchScore() {
        return matchScore;
    }
    
    public void setMatchScore(BigDecimal matchScore) {
        this.matchScore = matchScore;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
    
    // Builder class
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private UUID id;
        private StudentProfile student;
        private Job job;
        private BigDecimal matchScore;
        private String status = "pending";
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        
        public Builder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public Builder student(StudentProfile student) {
            this.student = student;
            return this;
        }
        
        public Builder job(Job job) {
            this.job = job;
            return this;
        }
        
        public Builder matchScore(BigDecimal matchScore) {
            this.matchScore = matchScore;
            return this;
        }
        
        public Builder status(String status) {
            this.status = status;
            return this;
        }
        
        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public Builder updatedAt(OffsetDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public Match build() {
            return new Match(id, student, job, matchScore, status, createdAt, updatedAt);
        }
    }
} 