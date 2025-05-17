package com.ojtech.api.service;

import com.ojtech.api.model.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.model.StudentProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ojtech.api.repository.StudentProfileRepository;
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

public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final ProfileRepository profileRepository;

    @Override
    public List<StudentProfile> getAllStudentProfiles() {
        return studentProfileRepository.findAll();
    }

    @Override
    public Optional<StudentProfile> getStudentProfileById(UUID id) {
        return studentProfileRepository.findById(id);
    }

    @Override
    public Optional<StudentProfile> getStudentProfileByProfileId(UUID profileId) {
        return profileRepository.findById(profileId)
                .flatMap(studentProfileRepository::findByProfile);
    }

    @Override
    public StudentProfile createStudentProfile(StudentProfile studentProfile) {
                studentProfile.getProfile() != null ? studentProfile.getProfile().getId() : "unknown");
        
        // Ensure the profile exists
        if (studentProfile.getProfile() != null && studentProfile.getProfile().getId() != null) {
            Profile profile = profileRepository.findById(studentProfile.getProfile().getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found with id: " + 
                            studentProfile.getProfile().getId()));
            
            studentProfile.setProfile(profile);
        }
        
        return studentProfileRepository.save(studentProfile);
    }

    @Override
    public StudentProfile updateStudentProfile(UUID id, StudentProfile studentProfileDetails) {
        
        return studentProfileRepository.findById(id)
                .map(existingProfile -> {
                    // Update fields but keep the same profile reference
                    Profile profile = existingProfile.getProfile();
                    
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
                    
                    // Keep the original profile reference
                    existingProfile.setProfile(profile);
                    
                    return studentProfileRepository.save(existingProfile);
                })
                .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + id));
    }

    @Override
    public void deleteStudentProfile(UUID id) {
        
        if (!studentProfileRepository.existsById(id)) {
            throw new RuntimeException("Student profile not found with id: " + id);
        }
        
        studentProfileRepository.deleteById(id);
    }
} 