package com.ojtech.api.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service

public class ProfileSecurityService {

    /**
     * Checks if the authenticated user is the owner of the profile with the given ID.
     * 
     * @param authentication The authentication object
     * @param profileId The profile ID to check
     * @return true if the user is the owner of the profile, false otherwise
     */
    public boolean isProfileOwner(Authentication authentication, UUID profileId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            return false;
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        return userDetails.getId().equals(profileId);
    }
    
    /**
     * Checks if the authenticated user is the employer with the given ID.
     * 
     * @param authentication The authentication object
     * @param employerId The employer ID to check
     * @return true if the user is the employer, false otherwise
     */
    public boolean isEmployer(Authentication authentication, UUID employerId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            return false;
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        return userDetails.getId().equals(employerId) && 
               userDetails.getAuthorities().stream()
                   .anyMatch(authority -> authority.getAuthority().equals("ROLE_EMPLOYER"));
    }
    
    /**
     * Checks if the authenticated user is the student with the given ID.
     * 
     * @param authentication The authentication object
     * @param studentId The student ID to check
     * @return true if the user is the student, false otherwise
     */
    public boolean isStudent(Authentication authentication, UUID studentId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetailsImpl)) {
            return false;
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        return userDetails.getId().equals(studentId) && 
               userDetails.getAuthorities().stream()
                   .anyMatch(authority -> authority.getAuthority().equals("ROLE_STUDENT"));
    }
} 