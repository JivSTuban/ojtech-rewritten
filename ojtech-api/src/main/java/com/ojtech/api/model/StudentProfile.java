package com.ojtech.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", referencedColumnName = "id", nullable = false, unique = true)
    private Profile profile; // Link to the base Profile entity

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

    // Constructors
    public StudentProfile() {
    }
    
    public StudentProfile(Profile profile) {
        this.profile = profile;
    }

    public StudentProfile(UUID id, Profile profile, String university, String course, String yearLevel, String bio, String githubProfile, String schoolEmail, String personalEmail, String phoneNumber, String country, String regionProvince, String city, String postalCode, String streetAddress, List<String> skills, String academicBackground) {
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
        this.skills = skills;
        this.academicBackground = academicBackground;
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

    // Builder
    public static StudentProfileBuilder builder() {
        return new StudentProfileBuilder();
    }

    public static class StudentProfileBuilder {
        private UUID id;
        private Profile profile;
        private String university;
        private String course;
        private String yearLevel;
        private String bio;
        private String githubProfile;
        private String schoolEmail;
        private String personalEmail;
        private String phoneNumber;
        private String country;
        private String regionProvince;
        private String city;
        private String postalCode;
        private String streetAddress;
        private List<String> skills;
        private String academicBackground;

        StudentProfileBuilder() {
        }

        public StudentProfileBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public StudentProfileBuilder profile(Profile profile) {
            this.profile = profile;
            return this;
        }

        public StudentProfileBuilder university(String university) {
            this.university = university;
            return this;
        }

        public StudentProfileBuilder course(String course) {
            this.course = course;
            return this;
        }

        public StudentProfileBuilder yearLevel(String yearLevel) {
            this.yearLevel = yearLevel;
            return this;
        }

        public StudentProfileBuilder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public StudentProfileBuilder githubProfile(String githubProfile) {
            this.githubProfile = githubProfile;
            return this;
        }

        public StudentProfileBuilder schoolEmail(String schoolEmail) {
            this.schoolEmail = schoolEmail;
            return this;
        }

        public StudentProfileBuilder personalEmail(String personalEmail) {
            this.personalEmail = personalEmail;
            return this;
        }

        public StudentProfileBuilder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }

        public StudentProfileBuilder country(String country) {
            this.country = country;
            return this;
        }

        public StudentProfileBuilder regionProvince(String regionProvince) {
            this.regionProvince = regionProvince;
            return this;
        }

        public StudentProfileBuilder city(String city) {
            this.city = city;
            return this;
        }

        public StudentProfileBuilder postalCode(String postalCode) {
            this.postalCode = postalCode;
            return this;
        }

        public StudentProfileBuilder streetAddress(String streetAddress) {
            this.streetAddress = streetAddress;
            return this;
        }

        public StudentProfileBuilder skills(List<String> skills) {
            this.skills = skills;
            return this;
        }

        public StudentProfileBuilder academicBackground(String academicBackground) {
            this.academicBackground = academicBackground;
            return this;
        }

        public StudentProfile build() {
            return new StudentProfile(id, profile, university, course, yearLevel, bio, githubProfile, schoolEmail, personalEmail, phoneNumber, country, regionProvince, city, postalCode, streetAddress, skills, academicBackground);
        }

        public String toString() {
            return "StudentProfile.StudentProfileBuilder(id=" + this.id + ", profile=" + (this.profile != null ? this.profile.getId() : null) + ", university=" + this.university + ", course=" + this.course + ", yearLevel=" + this.yearLevel + ", bio=" + this.bio + ", githubProfile=" + this.githubProfile + ", schoolEmail=" + this.schoolEmail + ", personalEmail=" + this.personalEmail + ", phoneNumber=" + this.phoneNumber + ", country=" + this.country + ", regionProvince=" + this.regionProvince + ", city=" + this.city + ", postalCode=" + this.postalCode + ", streetAddress=" + this.streetAddress + ", skills=" + this.skills + ", academicBackground=" + this.academicBackground + ")";
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StudentProfile that = (StudentProfile) o;
        return java.util.Objects.equals(id, that.id) &&
               java.util.Objects.equals(profile != null ? profile.getId() : null, that.profile != null ? that.profile.getId() : null) && // Compare by Profile ID
               java.util.Objects.equals(university, that.university) &&
               java.util.Objects.equals(course, that.course) &&
               java.util.Objects.equals(yearLevel, that.yearLevel) &&
               java.util.Objects.equals(bio, that.bio) &&
               java.util.Objects.equals(githubProfile, that.githubProfile) &&
               java.util.Objects.equals(schoolEmail, that.schoolEmail) &&
               java.util.Objects.equals(personalEmail, that.personalEmail) &&
               java.util.Objects.equals(phoneNumber, that.phoneNumber) &&
               java.util.Objects.equals(country, that.country) &&
               java.util.Objects.equals(regionProvince, that.regionProvince) &&
               java.util.Objects.equals(city, that.city) &&
               java.util.Objects.equals(postalCode, that.postalCode) &&
               java.util.Objects.equals(streetAddress, that.streetAddress) &&
               java.util.Objects.equals(skills, that.skills) &&
               java.util.Objects.equals(academicBackground, that.academicBackground);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id, 
                                      profile != null ? profile.getId() : null, // Hash by Profile ID
                                      university, course, yearLevel, bio, githubProfile, 
                                      schoolEmail, personalEmail, phoneNumber, country, 
                                      regionProvince, city, postalCode, streetAddress, 
                                      skills, academicBackground);
    }

    @Override
    public String toString() {
        return "StudentProfile{" +
               "id=" + id +
               ", profileId=" + (profile != null ? profile.getId() : null) + // Display Profile ID
               ", university='" + university + '\'' +
               ", course='" + course + '\'' +
               ", yearLevel='" + yearLevel + '\'' +
               ", bio='" + bio + '\'' +
               ", githubProfile='" + githubProfile + '\'' +
               ", schoolEmail='" + schoolEmail + '\'' +
               ", personalEmail='" + personalEmail + '\'' +
               ", phoneNumber='" + phoneNumber + '\'' +
               ", country='" + country + '\'' +
               ", regionProvince='" + regionProvince + '\'' +
               ", city='" + city + '\'' +
               ", postalCode='" + postalCode + '\'' +
               ", streetAddress='" + streetAddress + '\'' +
               ", skills=" + skills +
               ", academicBackground='" + academicBackground + '\'' +
               '}';
    }
} 