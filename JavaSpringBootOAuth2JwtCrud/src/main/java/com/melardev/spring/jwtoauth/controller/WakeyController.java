package com.melardev.spring.jwtoauth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class WakeyController {
    
    @GetMapping("/wakey")
    public ResponseEntity<?> wakey() {
        return ResponseEntity.ok(new MessageResponse("waking up"));
    }
}
