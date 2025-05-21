package com.melardev.spring.jwtoauth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth/api/auth")
public class LegacyAuthController {
    
    @Autowired
    private AuthController authController;
    
    @PostMapping({"/signup", "/register"})
    public ResponseEntity<?> registerUser(@Valid @RequestBody Object signUpRequest) {
        // Delegate to the original controller
        return authController.registerUser(signUpRequest);
    }
    
    @PostMapping({"/signin", "/login"})
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody Object loginRequest) {
        // Delegate to the original controller
        return authController.authenticateUser(loginRequest);
    }
} 