package com.ojtech.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cvs")
public class CV {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileUrl; // URL from Cloudinary or other storage

    private String fileType; // e.g., "application/pdf"

    private Long fileSize; // in bytes

    private LocalDateTime uploadedAt;

    private boolean isActive = false; // Indicates if this is the primary CV for the profile

    @Column(columnDefinition = "TEXT")
    private String extractedText; // Text extracted from CV by parser

    @Column(columnDefinition = "TEXT")
    private String skillsJson; // Parsed skills stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String experienceJson; // Parsed experience stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String educationJson; // Parsed education stored as JSON string

    private String processingStatus; // e.g., PENDING, PROCESSING, COMPLETED, FAILED
    private String processingError;
    
    // Additional fields needed based on compilation errors
    private Integer version;
    private String fileHash;
    private String status;
    private String errorMessage;
    private String analysisResults;
    private OffsetDateTime lastAnalyzedAt;
    private String extractedSkills;
    private String skills;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    public CV() {
    }

    public CV(Profile profile, String fileName, String fileUrl) {
        this.profile = profile;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.uploadedAt = LocalDateTime.now();
    }

    public CV(UUID id, Profile profile, String fileName, String fileUrl, String fileType, Long fileSize, LocalDateTime uploadedAt, boolean isActive, String extractedText, String skillsJson, String experienceJson, String educationJson, String processingStatus, String processingError) {
        this.id = id;
        this.profile = profile;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.isActive = isActive;
        this.extractedText = extractedText;
        this.skillsJson = skillsJson;
        this.experienceJson = experienceJson;
        this.educationJson = educationJson;
        this.processingStatus = processingStatus;
        this.processingError = processingError;
    }
    
    // Extended constructor with all fields
    public CV(UUID id, Profile profile, String fileName, String fileUrl, String fileType, Long fileSize, LocalDateTime uploadedAt, boolean isActive, String extractedText, String skillsJson, String experienceJson, String educationJson, String processingStatus, String processingError, Integer version, String fileHash, String status, String errorMessage, String analysisResults, OffsetDateTime lastAnalyzedAt, String extractedSkills, String skills) {
        this.id = id;
        this.profile = profile;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.isActive = isActive;
        this.extractedText = extractedText;
        this.skillsJson = skillsJson;
        this.experienceJson = experienceJson;
        this.educationJson = educationJson;
        this.processingStatus = processingStatus;
        this.processingError = processingError;
        this.version = version;
        this.fileHash = fileHash;
        this.status = status;
        this.errorMessage = errorMessage;
        this.analysisResults = analysisResults;
        this.lastAnalyzedAt = lastAnalyzedAt;
        this.extractedSkills = extractedSkills;
        this.skills = skills;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public String getSkillsJson() {
        return skillsJson;
    }

    public void setSkillsJson(String skillsJson) {
        this.skillsJson = skillsJson;
    }

    public String getExperienceJson() {
        return experienceJson;
    }

    public void setExperienceJson(String experienceJson) {
        this.experienceJson = experienceJson;
    }

    public String getEducationJson() {
        return educationJson;
    }

    public void setEducationJson(String educationJson) {
        this.educationJson = educationJson;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public String getProcessingError() {
        return processingError;
    }

    public void setProcessingError(String processingError) {
        this.processingError = processingError;
    }

    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
    
    public String getFileHash() {
        return fileHash;
    }
    
    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
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
    
    public Profile getUser() {
        return profile;
    }
    
    public void setUser(Profile user) {
        this.profile = user;
    }
    
    public boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public static CVBuilder builder() {
        return new CVBuilder();
    }

    public static class CVBuilder {
        private UUID id;
        private Profile profile;
        private String fileName;
        private String fileUrl;
        private String fileType;
        private Long fileSize;
        private LocalDateTime uploadedAt;
        private boolean isActive = false;
        private String extractedText;
        private String skillsJson;
        private String experienceJson;
        private String educationJson;
        private String processingStatus;
        private String processingError;
        private Integer version;
        private String fileHash;
        private String status;
        private String errorMessage;
        private String analysisResults;
        private OffsetDateTime lastAnalyzedAt;
        private String extractedSkills;
        private String skills;

        CVBuilder() {
        }

        public CVBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public CVBuilder profile(Profile profile) {
            this.profile = profile;
            return this;
        }

        public CVBuilder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public CVBuilder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }

        public CVBuilder fileType(String fileType) {
            this.fileType = fileType;
            return this;
        }

        public CVBuilder fileSize(Long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public CVBuilder uploadedAt(LocalDateTime uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public CVBuilder isActive(boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public CVBuilder extractedText(String extractedText) {
            this.extractedText = extractedText;
            return this;
        }

        public CVBuilder skillsJson(String skillsJson) {
            this.skillsJson = skillsJson;
            return this;
        }

        public CVBuilder experienceJson(String experienceJson) {
            this.experienceJson = experienceJson;
            return this;
        }

        public CVBuilder educationJson(String educationJson) {
            this.educationJson = educationJson;
            return this;
        }

        public CVBuilder processingStatus(String processingStatus) {
            this.processingStatus = processingStatus;
            return this;
        }

        public CVBuilder processingError(String processingError) {
            this.processingError = processingError;
            return this;
        }

        public CVBuilder version(Integer version) {
            this.version = version;
            return this;
        }
        
        public CVBuilder fileHash(String fileHash) {
            this.fileHash = fileHash;
            return this;
        }
        
        public CVBuilder status(String status) {
            this.status = status;
            return this;
        }
        
        public CVBuilder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }
        
        public CVBuilder analysisResults(String analysisResults) {
            this.analysisResults = analysisResults;
            return this;
        }
        
        public CVBuilder lastAnalyzedAt(OffsetDateTime lastAnalyzedAt) {
            this.lastAnalyzedAt = lastAnalyzedAt;
            return this;
        }
        
        public CVBuilder extractedSkills(String extractedSkills) {
            this.extractedSkills = extractedSkills;
            return this;
        }
        
        public CVBuilder skills(String skills) {
            this.skills = skills;
            return this;
        }
        
        public CVBuilder user(Profile user) {
            this.profile = user;
            return this;
        }

        public CV build() {
            return new CV(id, profile, fileName, fileUrl, fileType, fileSize, uploadedAt, isActive, extractedText, skillsJson, experienceJson, educationJson, processingStatus, processingError, version, fileHash, status, errorMessage, analysisResults, lastAnalyzedAt, extractedSkills, skills);
        }

        public String toString() {
            return "CV.CVBuilder(id=" + this.id + ", profile=" + (this.profile != null ? this.profile.getId() : null) + ", fileName=" + this.fileName + ", fileUrl=" + this.fileUrl + ", fileType=" + this.fileType + ", fileSize=" + this.fileSize + ", uploadedAt=" + this.uploadedAt + ", isActive=" + this.isActive + ", extractedText=" + this.extractedText + ", skillsJson=" + this.skillsJson + ", experienceJson=" + this.experienceJson + ", educationJson=" + this.educationJson + ", processingStatus=" + this.processingStatus + ", processingError=" + this.processingError + ", version=" + this.version + ", fileHash=" + this.fileHash + ", status=" + this.status + ", errorMessage=" + this.errorMessage + ", analysisResults=" + this.analysisResults + ", lastAnalyzedAt=" + this.lastAnalyzedAt + ", extractedSkills=" + this.extractedSkills + ", skills=" + this.skills + ")";
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CV cv = (CV) o;
        return isActive == cv.isActive &&
               java.util.Objects.equals(id, cv.id) &&
               java.util.Objects.equals(profile != null ? profile.getId() : null, cv.profile != null ? cv.profile.getId() : null) && // Compare by Profile ID
               java.util.Objects.equals(fileName, cv.fileName) &&
               java.util.Objects.equals(fileUrl, cv.fileUrl) &&
               java.util.Objects.equals(fileType, cv.fileType) &&
               java.util.Objects.equals(fileSize, cv.fileSize) &&
               java.util.Objects.equals(uploadedAt, cv.uploadedAt) &&
               java.util.Objects.equals(extractedText, cv.extractedText) &&
               java.util.Objects.equals(skillsJson, cv.skillsJson) &&
               java.util.Objects.equals(experienceJson, cv.experienceJson) &&
               java.util.Objects.equals(educationJson, cv.educationJson) &&
               java.util.Objects.equals(processingStatus, cv.processingStatus) &&
               java.util.Objects.equals(processingError, cv.processingError) &&
               java.util.Objects.equals(version, cv.version) &&
               java.util.Objects.equals(fileHash, cv.fileHash) &&
               java.util.Objects.equals(status, cv.status) &&
               java.util.Objects.equals(errorMessage, cv.errorMessage) &&
               java.util.Objects.equals(analysisResults, cv.analysisResults) &&
               java.util.Objects.equals(lastAnalyzedAt, cv.lastAnalyzedAt) &&
               java.util.Objects.equals(extractedSkills, cv.extractedSkills) &&
               java.util.Objects.equals(skills, cv.skills);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id, 
                                      profile != null ? profile.getId() : null, // Hash by Profile ID
                                      fileName, fileUrl, fileType, fileSize, uploadedAt, isActive, 
                                      extractedText, skillsJson, experienceJson, educationJson, 
                                      processingStatus, processingError, version, fileHash, status, errorMessage,
                                      analysisResults, lastAnalyzedAt, extractedSkills, skills);
    }

    @Override
    public String toString() {
        return "CV{" +
               "id=" + id +
               ", profileId=" + (profile != null ? profile.getId() : null) + // Display Profile ID
               ", fileName='" + fileName + '\'' +
               ", fileUrl='" + fileUrl + '\'' +
               ", fileType='" + fileType + '\'' +
               ", fileSize=" + fileSize +
               ", uploadedAt=" + uploadedAt +
               ", isActive=" + isActive +
               ", extractedText='" + (extractedText != null ? extractedText.substring(0, Math.min(extractedText.length(), 50)) + "..." : "null") + '\'' + // Truncate
               ", skillsJson='" + (skillsJson != null ? skillsJson.substring(0, Math.min(skillsJson.length(), 50)) + "..." : "null")  + '\'' + // Truncate
               ", experienceJson='" + (experienceJson != null ? experienceJson.substring(0, Math.min(experienceJson.length(), 50)) + "..." : "null")  + '\'' + // Truncate
               ", educationJson='" + (educationJson != null ? educationJson.substring(0, Math.min(educationJson.length(), 50)) + "..." : "null")  + '\'' + // Truncate
               ", processingStatus='" + processingStatus + '\'' +
               ", processingError='" + processingError + '\'' +
               ", version=" + version +
               ", fileHash='" + fileHash + '\'' +
               ", status='" + status + '\'' +
               ", errorMessage='" + errorMessage + '\'' +
               ", analysisResults='" + analysisResults + '\'' +
               ", lastAnalyzedAt=" + lastAnalyzedAt +
               ", extractedSkills='" + extractedSkills + '\'' +
               ", skills='" + skills + '\'' +
               '}';
    }
}
