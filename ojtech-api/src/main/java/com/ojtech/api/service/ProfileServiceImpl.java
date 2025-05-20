package com.ojtech.api.service;

import com.ojtech.api.model.*;
import com.ojtech.api.payload.request.EmployerOnboardingRequest;
import com.ojtech.api.payload.request.StudentOnboardingRequest;
import com.ojtech.api.repository.EmployerProfileRepository;
import com.ojtech.api.repository.ProfileRepository;
import com.ojtech.api.repository.StudentProfileRepository;
import com.ojtech.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final FileUploadService fileUploadService;
    private final PasswordEncoder passwordEncoder; // For saveProfile if password needs encoding

    public ProfileServiceImpl(UserRepository userRepository,
                              ProfileRepository profileRepository,
                              StudentProfileRepository studentProfileRepository,
                              EmployerProfileRepository employerProfileRepository,
                              FileUploadService fileUploadService,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.fileUploadService = fileUploadService;
        this.passwordEncoder = passwordEncoder;
    }

    // --- Base Profile Methods ---
    @Override
    public List<Profile> getAllProfiles() {
        log.debug("Fetching all profiles");
        return profileRepository.findAll();
    }

    @Override
    public Optional<Profile> getProfileById(UUID profileId) {
        log.debug("Fetching profile by ID: {}", profileId);
        return profileRepository.findById(profileId);
    }

    @Override
    public Optional<Profile> getProfileByEmail(String email) {
        log.debug("Fetching profile by email: {}", email);
        return profileRepository.findByEmail(email);
    }

    @Override
    public List<Profile> getProfilesByRole(UserRole role) {
        log.debug("Fetching profiles by role: {}", role);
        return profileRepository.findByRole(role);
    }

    @Override
    public Profile saveProfile(Profile profile) {
        log.info("Saving new profile for email: {}, role: {}", profile.getEmail(), profile.getRole());
        
        try {
        if (profileRepository.existsByEmail(profile.getEmail())) {
                log.error("Failed to save profile: Email already exists: {}", profile.getEmail());
            throw new RuntimeException("Error: Email is already in use!");
        }
            
        // If password is set on Profile and needs encoding:
        if (profile.getPassword() != null && !profile.getPassword().isEmpty()) {
                log.debug("Processing password for profile: {}", profile.getEmail());
                // Don't re-encode if it's already encoded (BCrypt passwords start with $2a$)
                if (!profile.getPassword().startsWith("$2a$")) {
                    log.debug("Encoding plain password for profile: {}", profile.getEmail());
             profile.setPassword(passwordEncoder.encode(profile.getPassword()));
                } else {
                    log.debug("Password already encoded, skipping encoding for profile: {}", profile.getEmail());
                }
            } else {
                log.warn("Profile being saved without password: {}", profile.getEmail());
            }
            
            Profile savedProfile = profileRepository.save(profile);
            log.info("Profile saved successfully: id={}, email={}, role={}", 
                    savedProfile.getId(), savedProfile.getEmail(), savedProfile.getRole());
            
            return savedProfile;
        } catch (Exception e) {
            log.error("Error saving profile for email {}: {}", profile.getEmail(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Profile updateProfile(UUID profileId, Profile profileDetails) {
        log.info("Updating profile with ID: {}", profileId);
        Profile existingProfile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + profileId));

        // Update editable fields
        existingProfile.setFullName(profileDetails.getFullName());
        existingProfile.setAvatarUrl(profileDetails.getAvatarUrl());
        // existingProfile.setGithubProfile(profileDetails.getGithubProfile()); // This seems student specific

        if (profileDetails.getEmail() != null && !existingProfile.getEmail().equals(profileDetails.getEmail())) {
            if (profileRepository.existsByEmail(profileDetails.getEmail())) {
                throw new RuntimeException("Error: Email is already in use by another account!");
            }
            existingProfile.setEmail(profileDetails.getEmail());
        }
        
        // Password update (if provided and not empty)
        if (profileDetails.getPassword() != null && !profileDetails.getPassword().trim().isEmpty()) {
            existingProfile.setPassword(passwordEncoder.encode(profileDetails.getPassword()));
        }
        
        // Role and HasCompletedOnboarding might be updated by specific processes or admin actions
        if(profileDetails.getRole() != null) {
            // Potentially add role change logic here, if allowed through this method (usually admin only)
            log.warn("Role change attempt for profile {} to {} via general update method.", profileId, profileDetails.getRole());
            // existingProfile.setRole(profileDetails.getRole());
        }
        if(profileDetails.getHasCompletedOnboarding() != null) {
            existingProfile.setHasCompletedOnboarding(profileDetails.getHasCompletedOnboarding());
        }

        return profileRepository.save(existingProfile);
    }

    @Override
    public void deleteProfile(UUID profileId) {
        log.info("Deleting profile with ID: {}", profileId);
        if (!profileRepository.existsById(profileId)) {
            throw new RuntimeException("Profile not found with id: " + profileId);
        }
        // Consider cascading deletes or handling related Student/Employer profiles
        profileRepository.deleteById(profileId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return profileRepository.existsByEmail(email);
    }
    
    @Override
    public Profile updateCvProcessingStatus(UUID profileId, String status, String errorMessage) {
        log.info("Updating CV processing status for profile ID {}: Status={}, Error='{}'", profileId, status, errorMessage);
        Profile profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));
        profile.setCvProcessingStatus(status);
        profile.setCvProcessingError(errorMessage);
        return profileRepository.save(profile);
    }

    // --- Student Profile Methods ---
    @Override
    @Transactional
    public StudentProfile completeStudentOnboarding(UUID userId, StudentOnboardingRequest request) {
        log.info("Completing student onboarding for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        Profile baseProfile = user.getProfile();
        if (baseProfile == null) {
            throw new RuntimeException("Base profile not found for user: " + userId);
        }

        StudentProfile studentProfile = studentProfileRepository.findByProfile_Id(baseProfile.getId())
                .orElseGet(() -> {
                    StudentProfile newSp = new StudentProfile();
                    newSp.setProfile(baseProfile);
                    return newSp;
                });

        // Assuming StudentOnboardingRequest has these fields, map them
        studentProfile.setUniversity(request.getUniversity());
        // studentProfile.setMajor(request.getMajor()); // If 'major' becomes 'course'
        studentProfile.setCourse(request.getCourse()); 
        studentProfile.setYearLevel(request.getYearLevel());
        studentProfile.setBio(request.getBio());
        studentProfile.setGithubProfile(request.getGithubUrl()); // Renamed from getGithubProfile to match request
        // studentProfile.setPersonalEmail(request.getPersonalEmail()); // if available in request
        // studentProfile.setPhoneNumber(request.getPhoneNumber()); // if available in request
        // studentProfile.setCountry(request.getCountry()); // etc.
        // studentProfile.setAcademicBackground(request.getAcademicBackgroundJson()); // If skills/education are complex

        baseProfile.setFullName(request.getFirstName() + " " + request.getLastName()); // Update base profile name
        baseProfile.setHasCompletedOnboarding(true);
        profileRepository.save(baseProfile);
        
        return studentProfileRepository.save(studentProfile);
    }

    @Override
    @Transactional
    public StudentProfile uploadStudentCv(UUID userId, MultipartFile cvFile) throws IOException {
        log.info("Uploading CV for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        Profile baseProfile = user.getProfile();
        if (baseProfile == null) {
            throw new RuntimeException("Base profile not found for user: " + userId);
        }
        StudentProfile studentProfile = studentProfileRepository.findByProfile_Id(baseProfile.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found for user id: " + userId));

        String cvUrl = fileUploadService.uploadFile(cvFile, "students/cvs/" + userId.toString());
        
        // Create new CV entry and link it to profile
        CV cv = new CV();
        cv.setProfile(baseProfile);
        cv.setFileUrl(cvUrl);
        cv.setFileName(cvFile.getOriginalFilename());
        cv.setUploadedAt(LocalDateTime.now());
        cv.setIsActive(true); // Set new CV as active, deactivate others if needed
        // cvRepository.save(cv); // Assuming a CVRepository exists
        
        // Update StudentProfile with a reference or directly if cvUrl is on StudentProfile
        // For now, let's assume the main profile holds the active CV URL for simplicity in this example
        baseProfile.setActiveCvUrl(cvUrl); 
        baseProfile.setCvProcessingStatus("PENDING");
        profileRepository.save(baseProfile);

        return studentProfile; // Or return the updated baseProfile or a combined DTO
    }

    @Override
    public Optional<StudentProfile> getStudentProfileByUserId(UUID userId) {
        log.debug("Fetching student profile by user ID: {}", userId);
        return userRepository.findById(userId)
                .flatMap(user -> user.getProfile() != null ? studentProfileRepository.findByProfile_Id(user.getProfile().getId()) : Optional.empty());
    }

    @Override
    public Optional<StudentProfile> getStudentProfileByProfileId(UUID profileId) {
        log.debug("Fetching student profile by base profile ID: {}", profileId);
        return studentProfileRepository.findByProfile_Id(profileId);
    }

    // --- Employer Profile Methods ---
    @Override
    @Transactional
    public EmployerProfile completeEmployerOnboarding(UUID userId, EmployerOnboardingRequest request) {
        log.info("Completing employer onboarding for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        Profile baseProfile = user.getProfile();
        if (baseProfile == null) {
            throw new RuntimeException("Base profile not found for user: " + userId);
        }

        EmployerProfile employerProfile = employerProfileRepository.findByProfile_Id(baseProfile.getId())
                .orElseGet(() -> {
                    EmployerProfile newEp = new EmployerProfile();
                    newEp.setProfile(baseProfile);
                    return newEp;
                });

        employerProfile.setCompanyName(request.getCompanyName());
        employerProfile.setCompanySize(request.getCompanySize());
        employerProfile.setIndustry(request.getIndustry());
        employerProfile.setCompanyWebsite(request.getCompanyWebsite());
        employerProfile.setCompanyDescription(request.getCompanyDescription());
        // employerProfile.setCompanyAddress(request.getCompanyAddress()); // If available
        // employerProfile.setContactPersonName(request.getContactPersonName()); // If available
        // ... map other fields from EmployerOnboardingRequest

        baseProfile.setFullName(request.getCompanyName()); // Or contact person name for employer
        baseProfile.setHasCompletedOnboarding(true);
        profileRepository.save(baseProfile);
        
        return employerProfileRepository.save(employerProfile);
    }

    @Override
    @Transactional
    public EmployerProfile uploadEmployerLogo(UUID userId, MultipartFile logoFile) throws IOException {
        log.info("Uploading employer logo for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        Profile baseProfile = user.getProfile();
        if (baseProfile == null) {
            throw new RuntimeException("Base profile not found for user: " + userId);
        }
        EmployerProfile employerProfile = employerProfileRepository.findByProfile_Id(baseProfile.getId())
                .orElseThrow(() -> new RuntimeException("Employer profile not found for user id: " + userId));

        String logoUrl = fileUploadService.uploadFile(logoFile, "employers/logos/" + userId.toString());
        employerProfile.setCompanyLogoUrl(logoUrl);
        
        // Also update avatar on base profile if desired
        baseProfile.setAvatarUrl(logoUrl);
        profileRepository.save(baseProfile);
        
        return employerProfileRepository.save(employerProfile);
    }

    @Override
    public Optional<EmployerProfile> getEmployerProfileByUserId(UUID userId) {
        log.debug("Fetching employer profile by user ID: {}", userId);
         return userRepository.findById(userId)
                .flatMap(user -> user.getProfile() != null ? employerProfileRepository.findByProfile_Id(user.getProfile().getId()) : Optional.empty());
    }

    @Override
    public Optional<EmployerProfile> getEmployerProfileByProfileId(UUID profileId) {
        log.debug("Fetching employer profile by base profile ID: {}", profileId);
        return employerProfileRepository.findByProfile_Id(profileId);
    }
} 