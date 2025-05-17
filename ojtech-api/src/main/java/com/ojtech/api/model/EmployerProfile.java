package com.ojtech.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "employer_profiles")
@Data
@NoArgsConstructor
public class EmployerProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
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
    public EmployerProfile(Profile profile) {
        this.profile = profile;
    }
} 