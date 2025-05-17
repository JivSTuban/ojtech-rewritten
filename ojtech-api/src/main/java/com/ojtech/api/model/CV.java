package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cvs")
public class CV {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @NotNull
    private Profile user;

    @Column(columnDefinition = "jsonb")
    private String extractedSkills;

    @Column(columnDefinition = "jsonb")
    private String skills;

    @Column(columnDefinition = "jsonb")
    private String analysisResults;

    private OffsetDateTime lastAnalyzedAt;

    private Integer version = 1;

    private Boolean isActive = true;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
    
    private String status;
    
    private String errorMessage;
    
    private String fileHash;
    
    // Default constructor
    public CV() {
    }
    
    // All-args constructor
    public CV(UUID id, Profile user, String extractedSkills, String skills, String analysisResults,
             OffsetDateTime lastAnalyzedAt, Integer version, Boolean isActive, OffsetDateTime createdAt,
             OffsetDateTime updatedAt, String status, String errorMessage, String fileHash) {
        this.id = id;
        this.user = user;
        this.extractedSkills = extractedSkills;
        this.skills = skills;
        this.analysisResults = analysisResults;
        this.lastAnalyzedAt = lastAnalyzedAt;
        this.version = version;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.errorMessage = errorMessage;
        this.fileHash = fileHash;
    }
    
    // Getters and setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Profile getUser() {
        return user;
    }
    
    public void setUser(Profile user) {
        this.user = user;
    }
    
    public String getExtractedSkills() {
        return extractedSkills;
    }
    
    public void setExtractedSkills(String extractedSkills) {
        this.extractedSkills = extractedSkills;
    }
    
    public String getSkills() {
        return skills;
    }
    
    public void setSkills(String skills) {
        this.skills = skills;
    }
    
    public String getAnalysisResults() {
        return analysisResults;
    }
    
    public void setAnalysisResults(String analysisResults) {
        this.analysisResults = analysisResults;
    }
    
    public OffsetDateTime getLastAnalyzedAt() {
        return lastAnalyzedAt;
    }
    
    public void setLastAnalyzedAt(OffsetDateTime lastAnalyzedAt) {
        this.lastAnalyzedAt = lastAnalyzedAt;
    }
    
    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
    
    public Boolean getIsActive() {
        return isActive != null ? isActive : false;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getFileHash() {
        return fileHash;
    }
    
    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }
    
    // Builder class
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private UUID id;
        private Profile user;
        private String extractedSkills;
        private String skills;
        private String analysisResults;
        private OffsetDateTime lastAnalyzedAt;
        private Integer version = 1;
        private Boolean isActive = true;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private String status;
        private String errorMessage;
        private String fileHash;
        
        public Builder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public Builder user(Profile user) {
            this.user = user;
            return this;
        }
        
        public Builder extractedSkills(String extractedSkills) {
            this.extractedSkills = extractedSkills;
            return this;
        }
        
        public Builder skills(String skills) {
            this.skills = skills;
            return this;
        }
        
        public Builder analysisResults(String analysisResults) {
            this.analysisResults = analysisResults;
            return this;
        }
        
        public Builder lastAnalyzedAt(OffsetDateTime lastAnalyzedAt) {
            this.lastAnalyzedAt = lastAnalyzedAt;
            return this;
        }
        
        public Builder version(Integer version) {
            this.version = version;
            return this;
        }
        
        public Builder isActive(Boolean isActive) {
            this.isActive = isActive;
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
        
        public Builder status(String status) {
            this.status = status;
            return this;
        }
        
        public Builder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }
        
        public Builder fileHash(String fileHash) {
            this.fileHash = fileHash;
            return this;
        }
        
        public CV build() {
            return new CV(id, user, extractedSkills, skills, analysisResults, lastAnalyzedAt, 
                         version, isActive, createdAt, updatedAt, status, errorMessage, fileHash);
        }
    }
} 