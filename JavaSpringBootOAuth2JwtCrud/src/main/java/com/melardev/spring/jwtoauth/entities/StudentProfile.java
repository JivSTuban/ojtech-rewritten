package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
public class StudentProfile extends Profile {
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "university")
    private String university;
    
    @Column(name = "major")
    private String major;
    
    @Column(name = "graduation_year")
    private Integer graduationYear;
    
    @Column(name = "skills")
    private String skills;
    
    @Column(name = "github_url")
    private String githubUrl;
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "portfolio_url")
    private String portfolioUrl;
    
    @Column(name = "active_cv_id")
    private UUID activeCvId;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CV> cvs = new ArrayList<>();
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<JobApplication> applications = new ArrayList<>();
    
    private String phoneNumber;
    private String bio;
    
    public StudentProfile() {
        super();
        setRole(UserRole.STUDENT);
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getUniversity() {
        return university;
    }
    
    public void setUniversity(String university) {
        this.university = university;
    }
    
    public String getMajor() {
        return major;
    }
    
    public void setMajor(String major) {
        this.major = major;
    }
    
    public Integer getGraduationYear() {
        return graduationYear;
    }
    
    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }
    
    public String getSkills() {
        return skills;
    }
    
    public void setSkills(String skills) {
        this.skills = skills;
    }
    
    public String getGithubUrl() {
        return githubUrl;
    }
    
    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
    
    public String getLinkedinUrl() {
        return linkedinUrl;
    }
    
    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
    
    public String getPortfolioUrl() {
        return portfolioUrl;
    }
    
    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }
    
    public UUID getActiveCvId() {
        return activeCvId;
    }
    
    public void setActiveCvId(UUID activeCvId) {
        this.activeCvId = activeCvId;
    }
    
    public List<CV> getCvs() {
        return cvs;
    }
    
    public void setCvs(List<CV> cvs) {
        this.cvs = cvs;
    }
    
    public void addCV(CV cv) {
        cvs.add(cv);
        cv.setStudent(this);
    }
    
    public void removeCV(CV cv) {
        cvs.remove(cv);
        cv.setStudent(null);
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public List<JobApplication> getApplications() {
        return applications;
    }
    
    public void setApplications(List<JobApplication> applications) {
        this.applications = applications;
    }
    
    public void addApplication(JobApplication application) {
        applications.add(application);
        application.setStudent(this);
    }
    
    public void removeApplication(JobApplication application) {
        applications.remove(application);
        application.setStudent(null);
    }
} 