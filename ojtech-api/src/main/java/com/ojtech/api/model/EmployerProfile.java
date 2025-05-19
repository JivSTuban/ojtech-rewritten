package com.ojtech.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "employer_profiles")
public class EmployerProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", referencedColumnName = "id", nullable = false, unique = true)
    private Profile profile; // Link to the base Profile entity

    // Employer-specific fields
    @Column(nullable = false)
    private String companyName;
    private String companySize; // e.g., "1-10", "11-50", "50+"
    private String industry;
    private String companyWebsite;
    @Column(columnDefinition = "TEXT")
    private String companyDescription;
    private String companyLogoUrl; // URL from Cloudinary
    
    // Contact person details (can be part of this entity or a separate ContactPerson entity)
    private String contactPersonName;
    private String contactPersonPosition;
    private String contactPersonEmail; 
    private String contactPersonPhone;
    
    // Company Address fields
    private String companyAddress_street;
    private String companyAddress_city;
    private String companyAddress_state;
    private String companyAddress_postalCode;
    private String companyAddress_country;

    // hasCompletedOnboarding is on the base Profile entity

    // Constructor if needed
    public EmployerProfile() {
    }

    public EmployerProfile(Profile profile) {
        this.profile = profile;
    }

    public EmployerProfile(UUID id, Profile profile, String companyName, String companySize, String industry, String companyWebsite, String companyDescription, String companyLogoUrl, String contactPersonName, String contactPersonPosition, String contactPersonEmail, String contactPersonPhone, String companyAddress_street, String companyAddress_city, String companyAddress_state, String companyAddress_postalCode, String companyAddress_country) {
        this.id = id;
        this.profile = profile;
        this.companyName = companyName;
        this.companySize = companySize;
        this.industry = industry;
        this.companyWebsite = companyWebsite;
        this.companyDescription = companyDescription;
        this.companyLogoUrl = companyLogoUrl;
        this.contactPersonName = contactPersonName;
        this.contactPersonPosition = contactPersonPosition;
        this.contactPersonEmail = contactPersonEmail;
        this.contactPersonPhone = contactPersonPhone;
        this.companyAddress_street = companyAddress_street;
        this.companyAddress_city = companyAddress_city;
        this.companyAddress_state = companyAddress_state;
        this.companyAddress_postalCode = companyAddress_postalCode;
        this.companyAddress_country = companyAddress_country;
    }

    // Getters and Setters
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

    public String getContactPersonName() {
        return contactPersonName;
    }

    public void setContactPersonName(String contactPersonName) {
        this.contactPersonName = contactPersonName;
    }

    public String getContactPersonPosition() {
        return contactPersonPosition;
    }

    public void setContactPersonPosition(String contactPersonPosition) {
        this.contactPersonPosition = contactPersonPosition;
    }

    public String getContactPersonEmail() {
        return contactPersonEmail;
    }

    public void setContactPersonEmail(String contactPersonEmail) {
        this.contactPersonEmail = contactPersonEmail;
    }

    public String getContactPersonPhone() {
        return contactPersonPhone;
    }

    public void setContactPersonPhone(String contactPersonPhone) {
        this.contactPersonPhone = contactPersonPhone;
    }

    public String getCompanyAddress_street() {
        return companyAddress_street;
    }

    public void setCompanyAddress_street(String companyAddress_street) {
        this.companyAddress_street = companyAddress_street;
    }

    public String getCompanyAddress_city() {
        return companyAddress_city;
    }

    public void setCompanyAddress_city(String companyAddress_city) {
        this.companyAddress_city = companyAddress_city;
    }

    public String getCompanyAddress_state() {
        return companyAddress_state;
    }

    public void setCompanyAddress_state(String companyAddress_state) {
        this.companyAddress_state = companyAddress_state;
    }

    public String getCompanyAddress_postalCode() {
        return companyAddress_postalCode;
    }

    public void setCompanyAddress_postalCode(String companyAddress_postalCode) {
        this.companyAddress_postalCode = companyAddress_postalCode;
    }

    public String getCompanyAddress_country() {
        return companyAddress_country;
    }

    public void setCompanyAddress_country(String companyAddress_country) {
        this.companyAddress_country = companyAddress_country;
    }

    // Builder
    public static EmployerProfileBuilder builder() {
        return new EmployerProfileBuilder();
    }

    public static class EmployerProfileBuilder {
        private UUID id;
        private Profile profile;
        private String companyName;
        private String companySize;
        private String industry;
        private String companyWebsite;
        private String companyDescription;
        private String companyLogoUrl;
        private String contactPersonName;
        private String contactPersonPosition;
        private String contactPersonEmail;
        private String contactPersonPhone;
        private String companyAddress_street;
        private String companyAddress_city;
        private String companyAddress_state;
        private String companyAddress_postalCode;
        private String companyAddress_country;

        EmployerProfileBuilder() {
        }

        public EmployerProfileBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public EmployerProfileBuilder profile(Profile profile) {
            this.profile = profile;
            return this;
        }

        public EmployerProfileBuilder companyName(String companyName) {
            this.companyName = companyName;
            return this;
        }

        public EmployerProfileBuilder companySize(String companySize) {
            this.companySize = companySize;
            return this;
        }

        public EmployerProfileBuilder industry(String industry) {
            this.industry = industry;
            return this;
        }

        public EmployerProfileBuilder companyWebsite(String companyWebsite) {
            this.companyWebsite = companyWebsite;
            return this;
        }

        public EmployerProfileBuilder companyDescription(String companyDescription) {
            this.companyDescription = companyDescription;
            return this;
        }

        public EmployerProfileBuilder companyLogoUrl(String companyLogoUrl) {
            this.companyLogoUrl = companyLogoUrl;
            return this;
        }

        public EmployerProfileBuilder contactPersonName(String contactPersonName) {
            this.contactPersonName = contactPersonName;
            return this;
        }

        public EmployerProfileBuilder contactPersonPosition(String contactPersonPosition) {
            this.contactPersonPosition = contactPersonPosition;
            return this;
        }

        public EmployerProfileBuilder contactPersonEmail(String contactPersonEmail) {
            this.contactPersonEmail = contactPersonEmail;
            return this;
        }

        public EmployerProfileBuilder contactPersonPhone(String contactPersonPhone) {
            this.contactPersonPhone = contactPersonPhone;
            return this;
        }

        public EmployerProfileBuilder companyAddress_street(String companyAddress_street) {
            this.companyAddress_street = companyAddress_street;
            return this;
        }

        public EmployerProfileBuilder companyAddress_city(String companyAddress_city) {
            this.companyAddress_city = companyAddress_city;
            return this;
        }

        public EmployerProfileBuilder companyAddress_state(String companyAddress_state) {
            this.companyAddress_state = companyAddress_state;
            return this;
        }

        public EmployerProfileBuilder companyAddress_postalCode(String companyAddress_postalCode) {
            this.companyAddress_postalCode = companyAddress_postalCode;
            return this;
        }

        public EmployerProfileBuilder companyAddress_country(String companyAddress_country) {
            this.companyAddress_country = companyAddress_country;
            return this;
        }

        public EmployerProfile build() {
            return new EmployerProfile(id, profile, companyName, companySize, industry, companyWebsite, companyDescription, companyLogoUrl, contactPersonName, contactPersonPosition, contactPersonEmail, contactPersonPhone, companyAddress_street, companyAddress_city, companyAddress_state, companyAddress_postalCode, companyAddress_country);
        }

        public String toString() {
            return "EmployerProfile.EmployerProfileBuilder(id=" + this.id + ", profile=" + (this.profile != null ? this.profile.getId() : null) + ", companyName=" + this.companyName + ", companySize=" + this.companySize + ", industry=" + this.industry + ", companyWebsite=" + this.companyWebsite + ", companyDescription=" + this.companyDescription + ", companyLogoUrl=" + this.companyLogoUrl + ", contactPersonName=" + this.contactPersonName + ", contactPersonPosition=" + this.contactPersonPosition + ", contactPersonEmail=" + this.contactPersonEmail + ", contactPersonPhone=" + this.contactPersonPhone + ", companyAddress_street=" + this.companyAddress_street + ", companyAddress_city=" + this.companyAddress_city + ", companyAddress_state=" + this.companyAddress_state + ", companyAddress_postalCode=" + this.companyAddress_postalCode + ", companyAddress_country=" + this.companyAddress_country + ")";
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmployerProfile that = (EmployerProfile) o;
        return java.util.Objects.equals(id, that.id) &&
               java.util.Objects.equals(profile != null ? profile.getId() : null, that.profile != null ? that.profile.getId() : null) && // Compare by Profile ID
               java.util.Objects.equals(companyName, that.companyName) &&
               java.util.Objects.equals(companySize, that.companySize) &&
               java.util.Objects.equals(industry, that.industry) &&
               java.util.Objects.equals(companyWebsite, that.companyWebsite) &&
               java.util.Objects.equals(companyDescription, that.companyDescription) &&
               java.util.Objects.equals(companyLogoUrl, that.companyLogoUrl) &&
               java.util.Objects.equals(contactPersonName, that.contactPersonName) &&
               java.util.Objects.equals(contactPersonPosition, that.contactPersonPosition) &&
               java.util.Objects.equals(contactPersonEmail, that.contactPersonEmail) &&
               java.util.Objects.equals(contactPersonPhone, that.contactPersonPhone) &&
               java.util.Objects.equals(companyAddress_street, that.companyAddress_street) &&
               java.util.Objects.equals(companyAddress_city, that.companyAddress_city) &&
               java.util.Objects.equals(companyAddress_state, that.companyAddress_state) &&
               java.util.Objects.equals(companyAddress_postalCode, that.companyAddress_postalCode) &&
               java.util.Objects.equals(companyAddress_country, that.companyAddress_country);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id, 
                                      profile != null ? profile.getId() : null, // Hash by Profile ID
                                      companyName, companySize, industry, companyWebsite, 
                                      companyDescription, companyLogoUrl, contactPersonName, 
                                      contactPersonPosition, contactPersonEmail, contactPersonPhone, 
                                      companyAddress_street, companyAddress_city, companyAddress_state, 
                                      companyAddress_postalCode, companyAddress_country);
    }

    @Override
    public String toString() {
        return "EmployerProfile{" +
               "id=" + id +
               ", profileId=" + (profile != null ? profile.getId() : null) + // Display Profile ID
               ", companyName='" + companyName + '\'' +
               ", companySize='" + companySize + '\'' +
               ", industry='" + industry + '\'' +
               ", companyWebsite='" + companyWebsite + '\'' +
               ", companyDescription='" + companyDescription + '\'' +
               ", companyLogoUrl='" + companyLogoUrl + '\'' +
               ", contactPersonName='" + contactPersonName + '\'' +
               ", contactPersonPosition='" + contactPersonPosition + '\'' +
               ", contactPersonEmail='" + contactPersonEmail + '\'' +
               ", contactPersonPhone='" + contactPersonPhone + '\'' +
               ", companyAddress_street='" + companyAddress_street + '\'' +
               ", companyAddress_city='" + companyAddress_city + '\'' +
               ", companyAddress_state='" + companyAddress_state + '\'' +
               ", companyAddress_postalCode='" + companyAddress_postalCode + '\'' +
               ", companyAddress_country='" + companyAddress_country + '\'' +
               '}';
    }
} 