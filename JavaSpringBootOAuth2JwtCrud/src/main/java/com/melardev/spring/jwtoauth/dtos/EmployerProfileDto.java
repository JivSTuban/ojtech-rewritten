package com.melardev.spring.jwtoauth.dtos;

import com.melardev.spring.jwtoauth.entities.EmployerProfile;

import java.util.UUID;

public class EmployerProfileDto {
    private UUID id;
    private String companyName;
    private String industry;
    private String location;
    private String companySize;
    private String companyDescription;
    private String websiteUrl;
    private String logoUrl;
    private String companyAddress;
    private String contactPersonName;
    private String contactPersonPosition;
    private String contactPersonEmail;
    private String contactPersonPhone;
    private Boolean verified;
    
    public EmployerProfileDto() {
    }
    
    public EmployerProfileDto(EmployerProfile employerProfile) {
        this.id = employerProfile.getId();
        this.companyName = employerProfile.getCompanyName();
        this.industry = employerProfile.getIndustry();
        this.location = employerProfile.getLocation();
        this.companySize = employerProfile.getCompanySize();
        this.companyDescription = employerProfile.getCompanyDescription();
        this.websiteUrl = employerProfile.getWebsiteUrl();
        this.logoUrl = employerProfile.getLogoUrl();
        this.companyAddress = employerProfile.getCompanyAddress();
        this.contactPersonName = employerProfile.getContactPersonName();
        this.contactPersonPosition = employerProfile.getContactPersonPosition();
        this.contactPersonEmail = employerProfile.getContactPersonEmail();
        this.contactPersonPhone = employerProfile.getContactPersonPhone();
        this.verified = employerProfile.getVerified();
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }
    
    public String getCompanyDescription() {
        return companyDescription;
    }
    
    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }
    
    public String getWebsiteUrl() {
        return websiteUrl;
    }
    
    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    
    public String getCompanyAddress() {
        return companyAddress;
    }
    
    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
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
    
    public Boolean getVerified() {
        return verified;
    }
    
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
    
    // For compatibility with JobDto
    public String getWebsite() {
        return websiteUrl;
    }
    
    public String getDescription() {
        return companyDescription;
    }
} 