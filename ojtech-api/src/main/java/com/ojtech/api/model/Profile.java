package com.ojtech.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @Email(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z]{2,}$", flags = Pattern.Flag.CASE_INSENSITIVE)
    @NotNull
    @Column(unique = true)
    private String email;

    @Column(length = 100, nullable = false)
    private String password;
    
    @Transient
    private String confirmPassword;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @NotNull
    private String fullName;

    private String avatarUrl;

    @Size(max = 500)
    private String githubProfile;

    private Boolean hasCompletedOnboarding = false;

    private Boolean hasUploadedCv = false;
    
    private String cvProcessingStatus;
    
    private String cvProcessingError;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<CV> cvs;
    
    private Boolean enabled = true;
    
    private Boolean accountNonExpired = true;
    
    private Boolean accountNonLocked = true;
    
    private Boolean credentialsNonExpired = true;
    
    public Profile() {
    }
    
    public Profile(UUID id, OffsetDateTime updatedAt, String email, String password, String confirmPassword,
                  UserRole role, String fullName, String avatarUrl, String githubProfile,
                  Boolean hasCompletedOnboarding, Boolean hasUploadedCv, String cvProcessingStatus,
                  String cvProcessingError, List<CV> cvs, Boolean enabled, Boolean accountNonExpired,
                  Boolean accountNonLocked, Boolean credentialsNonExpired) {
        this.id = id;
        this.updatedAt = updatedAt;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.role = role;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.githubProfile = githubProfile;
        this.hasCompletedOnboarding = hasCompletedOnboarding;
        this.hasUploadedCv = hasUploadedCv;
        this.cvProcessingStatus = cvProcessingStatus;
        this.cvProcessingError = cvProcessingError;
        this.cvs = cvs;
        this.enabled = enabled;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
    }
    
    // Explicit getters for fields commonly used in code
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public String getGithubProfile() {
        return githubProfile;
    }
    
    public void setGithubProfile(String githubProfile) {
        this.githubProfile = githubProfile;
    }
    
    public Boolean getEnabled() {
        return enabled != null ? enabled : true;
    }
    
    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
    
    public Boolean getAccountNonExpired() {
        return accountNonExpired != null ? accountNonExpired : true;
    }
    
    public void setAccountNonExpired(Boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
    }
    
    public Boolean getAccountNonLocked() {
        return accountNonLocked != null ? accountNonLocked : true;
    }
    
    public void setAccountNonLocked(Boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }
    
    public Boolean getCredentialsNonExpired() {
        return credentialsNonExpired != null ? credentialsNonExpired : true;
    }
    
    public void setCredentialsNonExpired(Boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
    }
    
    public List<CV> getCvs() {
        return cvs;
    }
    
    public void setCvs(List<CV> cvs) {
        this.cvs = cvs;
    }
    
    public String getCvProcessingStatus() {
        return cvProcessingStatus;
    }
    
    public void setCvProcessingStatus(String cvProcessingStatus) {
        this.cvProcessingStatus = cvProcessingStatus;
    }
    
    public String getCvProcessingError() {
        return cvProcessingError;
    }
    
    public void setCvProcessingError(String cvProcessingError) {
        this.cvProcessingError = cvProcessingError;
    }
    
    // Boolean getters
    public Boolean getHasCompletedOnboarding() {
        return hasCompletedOnboarding;
    }
    
    public void setHasCompletedOnboarding(Boolean hasCompletedOnboarding) {
        this.hasCompletedOnboarding = hasCompletedOnboarding;
    }
    
    public Boolean getHasUploadedCv() {
        return hasUploadedCv;
    }
    
    public void setHasUploadedCv(Boolean hasUploadedCv) {
        this.hasUploadedCv = hasUploadedCv;
    }
    
    // Add compatibility methods for 'is' prefix
    public boolean isHasCompletedOnboarding() {
        return hasCompletedOnboarding != null ? hasCompletedOnboarding : false;
    }
    
    public boolean isHasUploadedCv() {
        return hasUploadedCv != null ? hasUploadedCv : false;
    }
    
    // Explicit builder static method in case Lombok fails
    public static ProfileBuilder builder() {
        return new ProfileBuilder();
    }
    
    // Explicit builder class implementation
    public static class ProfileBuilder {
        private UUID id;
        private OffsetDateTime updatedAt;
        private String email;
        private String password;
        private String confirmPassword;
        private UserRole role;
        private String fullName;
        private String avatarUrl;
        private String githubProfile;
        private Boolean hasCompletedOnboarding = false;
        private Boolean hasUploadedCv = false;
        private String cvProcessingStatus;
        private String cvProcessingError;
        private List<CV> cvs;
        private Boolean enabled = true;
        private Boolean accountNonExpired = true;
        private Boolean accountNonLocked = true;
        private Boolean credentialsNonExpired = true;
        
        ProfileBuilder() {}
        
        public ProfileBuilder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public ProfileBuilder updatedAt(OffsetDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public ProfileBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public ProfileBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public ProfileBuilder confirmPassword(String confirmPassword) {
            this.confirmPassword = confirmPassword;
            return this;
        }
        
        public ProfileBuilder role(UserRole role) {
            this.role = role;
            return this;
        }
        
        public ProfileBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }
        
        public ProfileBuilder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }
        
        public ProfileBuilder githubProfile(String githubProfile) {
            this.githubProfile = githubProfile;
            return this;
        }
        
        public ProfileBuilder hasCompletedOnboarding(Boolean hasCompletedOnboarding) {
            this.hasCompletedOnboarding = hasCompletedOnboarding;
            return this;
        }
        
        public ProfileBuilder hasUploadedCv(Boolean hasUploadedCv) {
            this.hasUploadedCv = hasUploadedCv;
            return this;
        }
        
        public ProfileBuilder cvProcessingStatus(String cvProcessingStatus) {
            this.cvProcessingStatus = cvProcessingStatus;
            return this;
        }
        
        public ProfileBuilder cvProcessingError(String cvProcessingError) {
            this.cvProcessingError = cvProcessingError;
            return this;
        }
        
        public ProfileBuilder cvs(List<CV> cvs) {
            this.cvs = cvs;
            return this;
        }
        
        public ProfileBuilder enabled(Boolean enabled) {
            this.enabled = enabled;
            return this;
        }
        
        public ProfileBuilder accountNonExpired(Boolean accountNonExpired) {
            this.accountNonExpired = accountNonExpired;
            return this;
        }
        
        public ProfileBuilder accountNonLocked(Boolean accountNonLocked) {
            this.accountNonLocked = accountNonLocked;
            return this;
        }
        
        public ProfileBuilder credentialsNonExpired(Boolean credentialsNonExpired) {
            this.credentialsNonExpired = credentialsNonExpired;
            return this;
        }
        
        public Profile build() {
            return new Profile(id, updatedAt, email, password, confirmPassword, role, fullName, 
                              avatarUrl, githubProfile, hasCompletedOnboarding, hasUploadedCv,
                              cvProcessingStatus, cvProcessingError, cvs, enabled, 
                              accountNonExpired, accountNonLocked, credentialsNonExpired);
        }
    }
} 