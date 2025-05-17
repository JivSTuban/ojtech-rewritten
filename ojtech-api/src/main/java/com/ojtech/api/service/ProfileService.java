package com.ojtech.api.service;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.UserRole;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileService {
    List<Profile> getAllProfiles();
    Optional<Profile> getProfileById(UUID id);
    Optional<Profile> getProfileByEmail(String email);
    List<Profile> getProfilesByRole(UserRole role);
    Profile saveProfile(Profile profile);
    Profile updateProfile(UUID id, Profile profileDetails);
    void deleteProfile(UUID id);
    boolean existsByEmail(String email);
    Profile updateCvProcessingStatus(UUID id, String status, String errorMessage);
} 