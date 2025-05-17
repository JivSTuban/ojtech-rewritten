package com.ojtech.api.service;

import com.ojtech.api.model.EmployerProfile;
import com.ojtech.api.model.Profile;
import com.ojtech.api.model.StudentProfile;
import com.ojtech.api.model.UserRole;
import com.ojtech.api.payload.request.EmployerOnboardingRequest;
import com.ojtech.api.payload.request.StudentOnboardingRequest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileService {

    // Base Profile methods
    List<Profile> getAllProfiles(); // Admin
    Optional<Profile> getProfileById(UUID profileId);
    Optional<Profile> getProfileByEmail(String email);
    List<Profile> getProfilesByRole(UserRole role); // Admin
    Profile saveProfile(Profile profile); // Admin, for creating users outside normal registration
    Profile updateProfile(UUID profileId, Profile profileDetails); // Admin or owner
    void deleteProfile(UUID profileId); // Admin
    boolean existsByEmail(String email);
    Profile updateCvProcessingStatus(UUID profileId, String status, String errorMessage);

    // Student-specific methods
    StudentProfile completeStudentOnboarding(UUID userId, StudentOnboardingRequest request);
    StudentProfile uploadStudentCv(UUID userId, MultipartFile cvFile) throws IOException;
    Optional<StudentProfile> getStudentProfileByUserId(UUID userId);
    Optional<StudentProfile> getStudentProfileByProfileId(UUID profileId); // If student profile is separate from base Profile entity

    // Employer-specific methods
    EmployerProfile completeEmployerOnboarding(UUID userId, EmployerOnboardingRequest request);
    EmployerProfile uploadEmployerLogo(UUID userId, MultipartFile logoFile) throws IOException;
    Optional<EmployerProfile> getEmployerProfileByUserId(UUID userId);
    Optional<EmployerProfile> getEmployerProfileByProfileId(UUID profileId); // If employer profile is separate

}
