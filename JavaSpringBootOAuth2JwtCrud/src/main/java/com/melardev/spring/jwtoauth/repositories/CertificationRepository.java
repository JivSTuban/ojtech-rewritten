package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.Certification;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, UUID> {
    Set<Certification> findByStudentId(UUID studentId);
    Set<Certification> findByStudent(StudentProfile student);
    Set<Certification> findByCvId(UUID cvId);
} 