package com.ojtech.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Data
@NoArgsConstructor
@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", referencedColumnName = "id", nullable = false, unique = true)
    private Profile profile; // Link to the base Profile entity

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // This makes userId both PK and FK
    @JoinColumn(name = "user_id")
    private User user;

    private String university;
    private String course; // Changed from major
    private String yearLevel;
    @Column(columnDefinition = "TEXT")
    private String bio;
    private String githubProfile; // Renamed from githubUrl to be consistent
    
    // Fields from old StudentProfile model that might be useful, or are on Profile/User now
    // private String firstName; // Now on Profile.fullName
    // private String lastName; // Now on Profile.fullName
    private String schoolEmail;
    private String personalEmail; // Could be Profile.email or a secondary one
    private String phoneNumber; // Could be on Profile or here if student specific contact

    // Address fields (can be individual or a separate Embeddable Address object)
    private String country;
    private String regionProvince;
    private String city;
    private String postalCode;
    private String streetAddress;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "student_profile_id"))
    @Column(name = "skill")
    private List<String> skills; // From original model

    // Academic Background - can be JSON string or separate entities
    @Column(columnDefinition = "TEXT")
    private String academicBackground; // Was List<String> in old model, now JSON or Text
    
    // CV related fields are now primarily on CV entity linked to Profile
    // private String cvUrl;
    // private String cvFilename;
    // private LocalDateTime cvUploadedAt;

    // hasCompletedOnboarding is on the base Profile entity

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public StudentProfile(Profile profile) {
        this.profile = profile;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return user.getId();
    }

    public void setUserId(Long userId) {
        user.setId(userId);
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getYearLevel() {
        return yearLevel;
    }

    public void setYearLevel(String yearLevel) {
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

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getAcademicBackground() {
        return academicBackground;
    }

    public void setAcademicBackground(String academicBackground) {
        this.academicBackground = academicBackground;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 