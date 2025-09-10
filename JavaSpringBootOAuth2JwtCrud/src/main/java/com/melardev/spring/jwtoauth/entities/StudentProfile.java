package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "skills")
    private String skills;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "degree")
    private String degree;
    
    @Column(name = "institution")
    private String institution;
    
    @Column(name = "field_of_study")
    private String fieldOfStudy;
    
    @Column(name = "graduation_date")
    private LocalDate graduationDate;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
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
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<JobMatch> jobMatches = new ArrayList<>();
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Certification> certifications = new HashSet<>();
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkExperience> experiences = new HashSet<>();
    
    // Store GitHub projects as JSON string
    @Column(name = "github_projects", columnDefinition = "TEXT")
    private String githubProjects;
    
    private boolean hasCompletedOnboarding;

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
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getSkills() {
        return skills;
    }
    
    public void setSkills(String skills) {
        this.skills = skills;
    }
    
    public void setSkills(List<String> skills) {
        if (skills != null) {
            this.skills = String.join(", ", skills);
        } else {
            this.skills = null;
        }
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getDegree() {
        return degree;
    }
    
    public void setDegree(String degree) {
        this.degree = degree;
    }
    
    public String getInstitution() {
        return institution;
    }
    
    public void setInstitution(String institution) {
        this.institution = institution;
    }
    
    public String getFieldOfStudy() {
        return fieldOfStudy;
    }
    
    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }
    
    public LocalDate getGraduationDate() {
        return graduationDate;
    }
    
    public void setGraduationDate(LocalDate graduationDate) {
        this.graduationDate = graduationDate;
    }
    
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
    
    public String getGithubUrl() {
        return githubUrl;
    }
    
    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
    
    public void setGithub(String github) {
        this.githubUrl = github;
    }
    
    public String getLinkedinUrl() {
        return linkedinUrl;
    }
    
    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
    
    public void setLinkedIn(String linkedIn) {
        this.linkedinUrl = linkedIn;
    }
    
    public boolean isOnboardingCompleted() {
        return hasCompletedOnboarding;
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
    
    public Set<Certification> getCertifications() {
        return certifications;
    }
    
    public void setCertifications(Set<Certification> certifications) {
        this.certifications = certifications;
    }
    
    public void addCertification(Certification certification) {
        certifications.add(certification);
        certification.setStudent(this);
    }
    
    public void removeCertification(Certification certification) {
        certifications.remove(certification);
        certification.setStudent(null);
    }
    
    public Set<WorkExperience> getExperiences() {
        return experiences;
    }
    
    public void setExperiences(Set<WorkExperience> experiences) {
        this.experiences = experiences;
    }
    
    public void addExperience(WorkExperience experience) {
        experiences.add(experience);
        experience.setStudent(this);
    }
    
    public void removeExperience(WorkExperience experience) {
        experiences.remove(experience);
        experience.setStudent(null);
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
    
    public String getGithubProjects() {
        return githubProjects;
    }
    
    public void setGithubProjects(String githubProjects) {
        this.githubProjects = githubProjects;
    }
    
    public List<JobMatch> getJobMatches() {
        return jobMatches;
    }
    
    public void setJobMatches(List<JobMatch> jobMatches) {
        this.jobMatches = jobMatches;
    }
    
    public void addJobMatch(JobMatch jobMatch) {
        jobMatches.add(jobMatch);
        jobMatch.setStudent(this);
    }
    
    public void removeJobMatch(JobMatch jobMatch) {
        jobMatches.remove(jobMatch);
        jobMatch.setStudent(null);
    }
} 