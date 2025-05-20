package com.melardev.spring.jwtoauth.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    Map upload(MultipartFile file, String folder) throws IOException;
    void delete(String publicId) throws IOException;
} 