package com.ojtech.api.repository;

import com.ojtech.api.model.Profile;
import com.ojtech.api.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    
    Optional<Profile> findByEmail(String email);
    
    List<Profile> findByRole(UserRole role);
    
    Optional<Profile> findByEmailAndRole(String email, UserRole role);
    
    boolean existsByEmail(String email);
} 