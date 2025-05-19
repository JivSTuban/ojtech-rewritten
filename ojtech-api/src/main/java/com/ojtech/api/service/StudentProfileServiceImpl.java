package com.ojtech.api.service;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.StudentProfile;
import com.ojtech.api.repository.ProfileRepository;
import com.ojtech.api.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class StudentProfileServiceImpl implements StudentProfileService {

    private static final Logger log = LoggerFactory.getLogger(StudentProfileServiceImpl.class);

    private final StudentProfileRepository studentProfileRepository;
    private final ProfileRepository profileRepository;

    public StudentProfileServiceImpl(StudentProfileRepository studentProfileRepository, ProfileRepository profileRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    public List<StudentProfile> getAllStudentProfiles() {
        log.debug("Fetching all student profiles.");
        return studentProfileRepository.findAll();
    }

    @Override
    public Optional<StudentProfile> getStudentProfileById(UUID id) {
        log.debug("Fetching student profile by ID: {}", id);
        return studentProfileRepository.findById(id);
    }

    @Override
    public Optional<StudentProfile> getStudentProfileByProfileId(UUID profileId) {
        log.debug("Fetching student profile by profile ID: {}", profileId);
        return profileRepository.findById(profileId)
                .flatMap(studentProfileRepository::findByProfile);
    }

    @Override
    public StudentProfile createStudentProfile(StudentProfile studentProfile) {
        if (studentProfile == null) {
            throw new IllegalArgumentException("StudentProfile object cannot be null.");
        }
        log.info("Creating student profile for Profile ID: {}", 
                 studentProfile.getProfile() != null && studentProfile.getProfile().getId() != null 
                 ? studentProfile.getProfile().getId() : "unknown/not set");
        
        if (studentProfile.getProfile() != null && studentProfile.getProfile().getId() != null) {
            Profile profile = profileRepository.findById(studentProfile.getProfile().getId())
                    .orElseThrow(() -> {
                        log.error("Profile not found with ID: {} when creating student profile.", studentProfile.getProfile().getId());
                        return new RuntimeException("Profile not found with id: " + studentProfile.getProfile().getId());
                    });
            studentProfile.setProfile(profile); // Ensure managed entity is set
        } else {
            log.warn("Student profile is being created without a linked Profile object or Profile ID.");
            // Depending on requirements, might throw an error here if Profile must exist and be linked.
            // For now, proceed, but this student profile won't be associated with a core user profile.
        }
        
        return studentProfileRepository.save(studentProfile);
    }

    @Override
    public StudentProfile updateStudentProfile(UUID id, StudentProfile studentProfileDetails) {
        if (studentProfileDetails == null) {
            throw new IllegalArgumentException("StudentProfileDetails object cannot be null for update.");
        }
        log.info("Updating student profile with ID: {}", id);
        return studentProfileRepository.findById(id)
                .map(existingProfile -> {
                    log.debug("Found student profile to update for ID: {}. Current school email: {}", id, existingProfile.getSchoolEmail());
                    
                    // Profile (user link) should not change during this update.
                    // If studentProfileDetails.getProfile() is different, it should be handled carefully.
                    if (studentProfileDetails.getProfile() != null && 
                        !existingProfile.getProfile().getId().equals(studentProfileDetails.getProfile().getId())) {
                        log.warn("Attempt to change Profile (user link) during student profile update from ID {} to {} is not allowed. Ignoring.", 
                                 existingProfile.getProfile().getId(), studentProfileDetails.getProfile().getId());
                    }
                    // We keep the existingProfile.getProfile() reference.

                    existingProfile.setUniversity(studentProfileDetails.getUniversity());
                    existingProfile.setCourse(studentProfileDetails.getCourse());
                    existingProfile.setYearLevel(studentProfileDetails.getYearLevel());
                    existingProfile.setBio(studentProfileDetails.getBio());
                    existingProfile.setGithubProfile(studentProfileDetails.getGithubProfile());
                    existingProfile.setSchoolEmail(studentProfileDetails.getSchoolEmail());
                    existingProfile.setPersonalEmail(studentProfileDetails.getPersonalEmail());
                    existingProfile.setPhoneNumber(studentProfileDetails.getPhoneNumber());
                    existingProfile.setCountry(studentProfileDetails.getCountry());
                    existingProfile.setRegionProvince(studentProfileDetails.getRegionProvince());
                    existingProfile.setCity(studentProfileDetails.getCity());
                    existingProfile.setPostalCode(studentProfileDetails.getPostalCode());
                    existingProfile.setStreetAddress(studentProfileDetails.getStreetAddress());
                    existingProfile.setAcademicBackground(studentProfileDetails.getAcademicBackground());
                    
                    // existingProfile.setProfile(profile); // Profile is intentionally not changed from details.
                    
                    return studentProfileRepository.save(existingProfile);
                })
                .orElseThrow(() -> {
                    log.error("Student profile not found with ID: {} during update.", id);
                    return new RuntimeException("Student profile not found with id: " + id);
                });
    }

    @Override
    public void deleteStudentProfile(UUID id) {
        log.info("Deleting student profile with ID: {}", id);
        if (!studentProfileRepository.existsById(id)) {
            log.error("Attempted to delete non-existent student profile with ID: {}", id);
            throw new RuntimeException("Student profile not found with id: " + id);
        }
        studentProfileRepository.deleteById(id);
        log.info("Successfully deleted student profile with ID: {}", id);
    }

    @Override
    public Optional<StudentProfile> getStudentProfileByEmail(String email) {
        log.debug("Fetching student profile by email: {}", email);
        
        // First try to find the profile by email
        Optional<Profile> profileOpt = profileRepository.findByEmail(email);
        
        if (profileOpt.isPresent()) {
            Profile profile = profileOpt.get();
            log.debug("Found profile with ID: {} for email: {}", profile.getId(), email);
            
            // Now find the student profile linked to this profile
            return studentProfileRepository.findByProfile(profile);
        }
        
        // If not found by profile email, try school email or personal email
        Optional<StudentProfile> bySchoolEmail = studentProfileRepository.findBySchoolEmail(email);
        if (bySchoolEmail.isPresent()) {
            return bySchoolEmail;
        }
        
        return studentProfileRepository.findByPersonalEmail(email);
    }
} 