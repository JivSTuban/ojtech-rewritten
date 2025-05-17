package com.ojtech.api.service;

import com.ojtech.api.model.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
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

public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    @Override
    public Optional<Profile> getProfileById(UUID id) {
        return profileRepository.findById(id);
    }

    @Override
    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }

    @Override
    public List<Profile> getProfilesByRole(UserRole role) {
        return profileRepository.findByRole(role);
    }

    @Override
    public Profile saveProfile(Profile profile) {
        
        // Check if email already exists
        if (profileRepository.existsByEmail(profile.getEmail())) {
            throw new RuntimeException("Email already in use: " + profile.getEmail());
        }
        
        // Encode password if provided
        if (profile.getPassword() != null && !profile.getPassword().isEmpty()) {
            profile.setPassword(passwordEncoder.encode(profile.getPassword()));
        }
        
        return profileRepository.save(profile);
    }

    @Override
    public Profile updateProfile(UUID id, Profile profileDetails) {
        
        return profileRepository.findById(id)
                .map(existingProfile -> {
                    existingProfile.setFullName(profileDetails.getFullName());
                    existingProfile.setAvatarUrl(profileDetails.getAvatarUrl());
                    existingProfile.setGithubProfile(profileDetails.getGithubProfile());
                    
                    // Only update email if changed and not in use by another user
                    if (!existingProfile.getEmail().equals(profileDetails.getEmail())) {
                        if (profileRepository.existsByEmail(profileDetails.getEmail())) {
                            throw new RuntimeException("Email already in use: " + profileDetails.getEmail());
                        }
                        existingProfile.setEmail(profileDetails.getEmail());
                    }
                    
                    // Only update password if provided
                    if (profileDetails.getPassword() != null && !profileDetails.getPassword().isEmpty()) {
                        existingProfile.setPassword(passwordEncoder.encode(profileDetails.getPassword()));
                    }
                    
                    // Only admin can change roles
                    // This would be controlled at the controller level with @PreAuthorize
                    
                    return profileRepository.save(existingProfile);
                })
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    @Override
    public void deleteProfile(UUID id) {
        
        if (!profileRepository.existsById(id)) {
            throw new RuntimeException("Profile not found with id: " + id);
        }
        
        profileRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return profileRepository.existsByEmail(email);
    }

    @Override
    public Profile updateCvProcessingStatus(UUID id, String status, String errorMessage) {
        
        return profileRepository.findById(id)
                .map(profile -> {
                    profile.setCvProcessingStatus(status);
                    profile.setCvProcessingError(errorMessage);
                    return profileRepository.save(profile);
                })
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }
} 