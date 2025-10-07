package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.requests.CompanyCreateRequest;
import com.melardev.spring.jwtoauth.dtos.responses.CompanyResponseDTO;
import com.melardev.spring.jwtoauth.entities.Company;
import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST Controller for Company management
 * Accessible only by NLO Staff (ROLE_EMPLOYER)
 */
@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private EmployerProfileRepository employerProfileRepository;
    
    /**
     * Get all companies
     * Accessible by NLO Staff
     */
    @GetMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies() {
        List<Company> companies = companyService.getAllCompanies();
        List<CompanyResponseDTO> response = companies.stream()
                .map(CompanyResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get active companies only
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<CompanyResponseDTO>> getActiveCompanies() {
        List<Company> companies = companyService.getActiveCompanies();
        List<CompanyResponseDTO> response = companies.stream()
                .map(CompanyResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get company by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable UUID id) {
        Company company = companyService.getCompanyById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return ResponseEntity.ok(new CompanyResponseDTO(company));
    }
    
    /**
     * Create a new company
     * Only NLO Staff can create companies
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponseDTO> createCompany(
            @Valid @RequestBody CompanyCreateRequest request) {
        
        // Get current user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        // Get NLO profile
        EmployerProfile nloProfile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("NLO profile not found"));
        
        Company company = companyService.createCompany(request, nloProfile);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CompanyResponseDTO(company));
    }
    
    /**
     * Update a company
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyCreateRequest request) {
        
        Company company = companyService.updateCompany(id, request);
        return ResponseEntity.ok(new CompanyResponseDTO(company));
    }
    
    /**
     * Delete a company
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Deactivate a company
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponseDTO> deactivateCompany(@PathVariable UUID id) {
        Company company = companyService.deactivateCompany(id);
        return ResponseEntity.ok(new CompanyResponseDTO(company));
    }
    
    /**
     * Activate a company
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<CompanyResponseDTO> activateCompany(@PathVariable UUID id) {
        Company company = companyService.activateCompany(id);
        return ResponseEntity.ok(new CompanyResponseDTO(company));
    }
}
