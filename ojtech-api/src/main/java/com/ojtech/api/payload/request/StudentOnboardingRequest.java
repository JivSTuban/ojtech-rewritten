package com.ojtech.api.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class StudentOnboardingRequest {

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 100)
    private String university;

    @Size(max = 100)
    private String major;

    @Size(max = 100)
    private String course;

    @Size(max = 50)
    private String yearLevel;

    private Integer graduationYear;

    @Size(max = 2000)
    private String bio;

    private List<String> skills;

    @Size(max = 255)
    private String githubUrl;

    @Size(max = 255)
    private String linkedinUrl;

    @Size(max = 255)
    private String portfolioUrl;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    // Additional getters and setters
    public String getCourse() { return major; } // Using major as course for compatibility
    public String getYearLevel() { return graduationYear != null ? graduationYear.toString() : null; }
    public void setCourse(String course) { this.course = course; }
    public void setYearLevel(String yearLevel) { this.yearLevel = yearLevel; }
} 