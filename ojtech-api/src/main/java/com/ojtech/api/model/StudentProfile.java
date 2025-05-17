package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private Profile profile;

    private String university;

    private String course;

    @Min(1)
    @Max(6)
    private Integer yearLevel;

    private String bio;

    @Size(max = 500)
    private String githubProfile;

    @Column(unique = true)
    @NotNull
    private String schoolEmail;

    @Column(unique = true)
    private String personalEmail;

    private String phoneNumber;

    private String country = "Philippines";

    private String regionProvince;

    private String city;

    private String postalCode;

    private String streetAddress;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
    
    @Column(columnDefinition = "jsonb")
    private String academicBackground;
    
    // Default constructor
    public StudentProfile() {
    }
    
    // All-args constructor
    public StudentProfile(UUID id, Profile profile, String university, String course, Integer yearLevel, 
                         String bio, String githubProfile, String schoolEmail, String personalEmail, 
                         String phoneNumber, String country, String regionProvince, String city, 
                         String postalCode, String streetAddress, OffsetDateTime createdAt, 
                         OffsetDateTime updatedAt, String academicBackground) {
        this.id = id;
        this.profile = profile;
        this.university = university;
        this.course = course;
        this.yearLevel = yearLevel;
        this.bio = bio;
        this.githubProfile = githubProfile;
        this.schoolEmail = schoolEmail;
        this.personalEmail = personalEmail;
        this.phoneNumber = phoneNumber;
        this.country = country;
        this.regionProvince = regionProvince;
        this.city = city;
        this.postalCode = postalCode;
        this.streetAddress = streetAddress;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.academicBackground = academicBackground;
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

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Integer getYearLevel() {
        return yearLevel;
    }

    public void setYearLevel(Integer yearLevel) {
        this.yearLevel = yearLevel;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getGithubProfile() {
        return githubProfile;
    }

    public void setGithubProfile(String githubProfile) {
        this.githubProfile = githubProfile;
    }

    public String getSchoolEmail() {
        return schoolEmail;
    }

    public void setSchoolEmail(String schoolEmail) {
        this.schoolEmail = schoolEmail;
    }

    public String getPersonalEmail() {
        return personalEmail;
    }

    public void setPersonalEmail(String personalEmail) {
        this.personalEmail = personalEmail;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRegionProvince() {
        return regionProvince;
    }

    public void setRegionProvince(String regionProvince) {
        this.regionProvince = regionProvince;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
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

    public String getAcademicBackground() {
        return academicBackground;
    }

    public void setAcademicBackground(String academicBackground) {
        this.academicBackground = academicBackground;
    }
    
    // Builder class
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private UUID id;
        private Profile profile;
        private String university;
        private String course;
        private Integer yearLevel;
        private String bio;
        private String githubProfile;
        private String schoolEmail;
        private String personalEmail;
        private String phoneNumber;
        private String country = "Philippines";
        private String regionProvince;
        private String city;
        private String postalCode;
        private String streetAddress;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private String academicBackground;
        
        public Builder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public Builder profile(Profile profile) {
            this.profile = profile;
            return this;
        }
        
        public Builder university(String university) {
            this.university = university;
            return this;
        }
        
        public Builder course(String course) {
            this.course = course;
            return this;
        }
        
        public Builder yearLevel(Integer yearLevel) {
            this.yearLevel = yearLevel;
            return this;
        }
        
        public Builder bio(String bio) {
            this.bio = bio;
            return this;
        }
        
        public Builder githubProfile(String githubProfile) {
            this.githubProfile = githubProfile;
            return this;
        }
        
        public Builder schoolEmail(String schoolEmail) {
            this.schoolEmail = schoolEmail;
            return this;
        }
        
        public Builder personalEmail(String personalEmail) {
            this.personalEmail = personalEmail;
            return this;
        }
        
        public Builder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }
        
        public Builder country(String country) {
            this.country = country;
            return this;
        }
        
        public Builder regionProvince(String regionProvince) {
            this.regionProvince = regionProvince;
            return this;
        }
        
        public Builder city(String city) {
            this.city = city;
            return this;
        }
        
        public Builder postalCode(String postalCode) {
            this.postalCode = postalCode;
            return this;
        }
        
        public Builder streetAddress(String streetAddress) {
            this.streetAddress = streetAddress;
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
        
        public Builder academicBackground(String academicBackground) {
            this.academicBackground = academicBackground;
            return this;
        }
        
        public StudentProfile build() {
            return new StudentProfile(id, profile, university, course, yearLevel, bio, githubProfile, 
                                     schoolEmail, personalEmail, phoneNumber, country, regionProvince, 
                                     city, postalCode, streetAddress, createdAt, updatedAt, academicBackground);
        }
    }
} 