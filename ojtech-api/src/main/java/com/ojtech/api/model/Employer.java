package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "employers")
public class Employer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @NotNull
    private String companyName;

    @NotNull
    private String companySize;

    @NotNull
    private String industry;

    private String companyWebsite;

    private String companyDescription;

    private String companyLogoUrl;

    @NotNull
    private String companyAddress;

    @NotNull
    private String contactPerson;

    @NotNull
    private String position;

    @NotNull
    private String contactEmail;

    private String contactPhone;

    private Boolean verified = false;

    private OffsetDateTime verificationDate;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String onboardingProgress = "{\"company_info\": false, \"company_logo\": false, \"contact_details\": false}";
    
    // Default constructor
    public Employer() {
    }
    
    // All-args constructor
    public Employer(UUID id, Profile profile, String companyName, String companySize, String industry,
                  String companyWebsite, String companyDescription, String companyLogoUrl, String companyAddress,
                  String contactPerson, String position, String contactEmail, String contactPhone,
                  Boolean verified, OffsetDateTime verificationDate, OffsetDateTime createdAt,
                  OffsetDateTime updatedAt, String onboardingProgress) {
        this.id = id;
        this.profile = profile;
        this.companyName = companyName;
        this.companySize = companySize;
        this.industry = industry;
        this.companyWebsite = companyWebsite;
        this.companyDescription = companyDescription;
        this.companyLogoUrl = companyLogoUrl;
        this.companyAddress = companyAddress;
        this.contactPerson = contactPerson;
        this.position = position;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.verified = verified;
        this.verificationDate = verificationDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.onboardingProgress = onboardingProgress;
    }
    
    // Getters and setters
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
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public String getCompanyWebsite() {
        return companyWebsite;
    }
    
    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }
    
    public String getCompanyDescription() {
        return companyDescription;
    }
    
    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }
    
    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }
    
    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }
    
    public String getCompanyAddress() {
        return companyAddress;
    }
    
    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }
    
    public String getContactPerson() {
        return contactPerson;
    }
    
    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }
    
    public String getPosition() {
        return position;
    }
    
    public void setPosition(String position) {
        this.position = position;
    }
    
    public String getContactEmail() {
        return contactEmail;
    }
    
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
    
    public String getContactPhone() {
        return contactPhone;
    }
    
    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }
    
    public Boolean getVerified() {
        return verified;
    }
    
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
    
    public OffsetDateTime getVerificationDate() {
        return verificationDate;
    }
    
    public void setVerificationDate(OffsetDateTime verificationDate) {
        this.verificationDate = verificationDate;
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
    
    public String getOnboardingProgress() {
        return onboardingProgress;
    }
    
    public void setOnboardingProgress(String onboardingProgress) {
        this.onboardingProgress = onboardingProgress;
    }
    
    // Builder class
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private UUID id;
        private Profile profile;
        private String companyName;
        private String companySize;
        private String industry;
        private String companyWebsite;
        private String companyDescription;
        private String companyLogoUrl;
        private String companyAddress;
        private String contactPerson;
        private String position;
        private String contactEmail;
        private String contactPhone;
        private Boolean verified = false;
        private OffsetDateTime verificationDate;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private String onboardingProgress = "{\"company_info\": false, \"company_logo\": false, \"contact_details\": false}";
        
        public Builder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public Builder profile(Profile profile) {
            this.profile = profile;
            return this;
        }
        
        public Builder companyName(String companyName) {
            this.companyName = companyName;
            return this;
        }
        
        public Builder companySize(String companySize) {
            this.companySize = companySize;
            return this;
        }
        
        public Builder industry(String industry) {
            this.industry = industry;
            return this;
        }
        
        public Builder companyWebsite(String companyWebsite) {
            this.companyWebsite = companyWebsite;
            return this;
        }
        
        public Builder companyDescription(String companyDescription) {
            this.companyDescription = companyDescription;
            return this;
        }
        
        public Builder companyLogoUrl(String companyLogoUrl) {
            this.companyLogoUrl = companyLogoUrl;
            return this;
        }
        
        public Builder companyAddress(String companyAddress) {
            this.companyAddress = companyAddress;
            return this;
        }
        
        public Builder contactPerson(String contactPerson) {
            this.contactPerson = contactPerson;
            return this;
        }
        
        public Builder position(String position) {
            this.position = position;
            return this;
        }
        
        public Builder contactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
            return this;
        }
        
        public Builder contactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
            return this;
        }
        
        public Builder verified(Boolean verified) {
            this.verified = verified;
            return this;
        }
        
        public Builder verificationDate(OffsetDateTime verificationDate) {
            this.verificationDate = verificationDate;
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
        
        public Builder onboardingProgress(String onboardingProgress) {
            this.onboardingProgress = onboardingProgress;
            return this;
        }
        
        public Employer build() {
            return new Employer(id, profile, companyName, companySize, industry, companyWebsite,
                              companyDescription, companyLogoUrl, companyAddress, contactPerson,
                              position, contactEmail, contactPhone, verified, verificationDate,
                              createdAt, updatedAt, onboardingProgress);
        }
    }
} 