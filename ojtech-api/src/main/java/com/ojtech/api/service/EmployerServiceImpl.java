package com.ojtech.api.service;

import com.ojtech.api.model.Employer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.EmployerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service

@Transactional

public class EmployerServiceImpl implements EmployerService {

    private final EmployerRepository employerRepository;
    private final ProfileRepository profileRepository;

    @Override
    public List<Employer> getAllEmployers() {
        return employerRepository.findAll();
    }

    @Override
    public Optional<Employer> getEmployerById(UUID id) {
        return employerRepository.findById(id);
    }

    @Override
    public Optional<Employer> getEmployerByProfileId(UUID profileId) {
        return profileRepository.findById(profileId)
                .flatMap(employerRepository::findByProfile);
    }

    @Override
    public List<Employer> getEmployersByVerificationStatus(boolean verified) {
        return employerRepository.findByVerified(verified);
    }

    @Override
    public List<Employer> getEmployersByIndustry(String industry) {
        return employerRepository.findByIndustryContainingIgnoreCase(industry);
    }

    @Override
    public Employer createEmployer(Employer employer) {
        
        // Ensure the profile exists
        if (employer.getProfile() != null && employer.getProfile().getId() != null) {
            Profile profile = profileRepository.findById(employer.getProfile().getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found with id: " + 
                            employer.getProfile().getId()));
            
            employer.setProfile(profile);
        }
        
        return employerRepository.save(employer);
    }

    @Override
    public Employer updateEmployer(UUID id, Employer employerDetails) {
        
        return employerRepository.findById(id)
                .map(existingEmployer -> {
                    // Update fields but keep the same profile reference
                    Profile profile = existingEmployer.getProfile();
                    
                    existingEmployer.setCompanyName(employerDetails.getCompanyName());
                    existingEmployer.setCompanySize(employerDetails.getCompanySize());
                    existingEmployer.setIndustry(employerDetails.getIndustry());
                    existingEmployer.setCompanyWebsite(employerDetails.getCompanyWebsite());
                    existingEmployer.setCompanyDescription(employerDetails.getCompanyDescription());
                    existingEmployer.setCompanyLogoUrl(employerDetails.getCompanyLogoUrl());
                    existingEmployer.setCompanyAddress(employerDetails.getCompanyAddress());
                    existingEmployer.setContactPerson(employerDetails.getContactPerson());
                    existingEmployer.setPosition(employerDetails.getPosition());
                    existingEmployer.setContactEmail(employerDetails.getContactEmail());
                    existingEmployer.setContactPhone(employerDetails.getContactPhone());
                    existingEmployer.setOnboardingProgress(employerDetails.getOnboardingProgress());
                    
                    // Keep the original profile reference and verification status
                    existingEmployer.setProfile(profile);
                    
                    return employerRepository.save(existingEmployer);
                })
                .orElseThrow(() -> new RuntimeException("Employer not found with id: " + id));
    }

    @Override
    public Employer updateVerificationStatus(UUID id, boolean verified) {
        
        return employerRepository.findById(id)
                .map(employer -> {
                    employer.setVerified(verified);
                    
                    // If now verified, set verification date
                    if (verified) {
                        employer.setVerificationDate(OffsetDateTime.now());
                    } else {
                        employer.setVerificationDate(null);
                    }
                    
                    return employerRepository.save(employer);
                })
                .orElseThrow(() -> new RuntimeException("Employer not found with id: " + id));
    }

    @Override
    public void deleteEmployer(UUID id) {
        
        if (!employerRepository.existsById(id)) {
            throw new RuntimeException("Employer not found with id: " + id);
        }
        
        employerRepository.deleteById(id);
    }
} 