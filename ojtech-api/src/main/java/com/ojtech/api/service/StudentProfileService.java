package com.ojtech.api.service;

import com.ojtech.api.model.StudentProfile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentProfileService {
    List<StudentProfile> getAllStudentProfiles();
    Optional<StudentProfile> getStudentProfileById(UUID id);
    Optional<StudentProfile> getStudentProfileByProfileId(UUID profileId);
    Optional<StudentProfile> getStudentProfileByEmail(String email);
    StudentProfile createStudentProfile(StudentProfile studentProfile);
    StudentProfile updateStudentProfile(UUID id, StudentProfile studentProfile);
    void deleteStudentProfile(UUID id);
} 