package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_assessments")
public class SkillAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @NotNull
    private Profile user;

    @NotNull
    @Size(min = 1, max = 100)
    private String skillName;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer proficiencyLevel;

    private String description;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
    
    // Default constructor
    public SkillAssessment() {
    }
    
    // All-args constructor
    public SkillAssessment(UUID id, Profile user, String skillName, Integer proficiencyLevel, 
                         String description, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.skillName = skillName;
        this.proficiencyLevel = proficiencyLevel;
        this.description = description;
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
    
    public Profile getUser() {
        return user;
    }
    
    public void setUser(Profile user) {
        this.user = user;
    }
    
    public String getSkillName() {
        return skillName;
    }
    
    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
    
    public Integer getProficiencyLevel() {
        return proficiencyLevel;
    }
    
    public void setProficiencyLevel(Integer proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
        private Profile user;
        private String skillName;
        private Integer proficiencyLevel;
        private String description;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        
        public Builder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public Builder user(Profile user) {
            this.user = user;
            return this;
        }
        
        public Builder skillName(String skillName) {
            this.skillName = skillName;
            return this;
        }
        
        public Builder proficiencyLevel(Integer proficiencyLevel) {
            this.proficiencyLevel = proficiencyLevel;
            return this;
        }
        
        public Builder description(String description) {
            this.description = description;
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
        
        public SkillAssessment build() {
            return new SkillAssessment(id, user, skillName, proficiencyLevel, description, createdAt, updatedAt);
        }
    }
} 
 