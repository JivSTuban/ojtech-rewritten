package com.ojtech.api.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EmployerOnboardingRequest {

    @NotBlank
    @Size(max = 100)
    private String companyName;

    @Size(max = 50)
    private String companySize;

    @Size(max = 100)
    private String industry;

    @Size(max = 255)
    private String companyWebsite;

    @Size(max = 2000)
    private String companyDescription;

    @Size(max = 255)
    private String companyAddress;

    @Size(max = 100)
    private String contactPersonName;

    @Size(max = 100)
    private String contactPersonPosition;

    @Email
    @Size(max = 100)
    private String contactPersonEmail;

    @Size(max = 20)
    private String contactPersonPhone;

    // Getters and Setters
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }
    public String getCompanyAddress() { return companyAddress; }
    public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }
    public String getContactPersonName() { return contactPersonName; }
    public void setContactPersonName(String contactPersonName) { this.contactPersonName = contactPersonName; }
    public String getContactPersonPosition() { return contactPersonPosition; }
    public void setContactPersonPosition(String contactPersonPosition) { this.contactPersonPosition = contactPersonPosition; }
    public String getContactPersonEmail() { return contactPersonEmail; }
    public void setContactPersonEmail(String contactPersonEmail) { this.contactPersonEmail = contactPersonEmail; }
    public String getContactPersonPhone() { return contactPersonPhone; }
    public void setContactPersonPhone(String contactPersonPhone) { this.contactPersonPhone = contactPersonPhone; }
} 