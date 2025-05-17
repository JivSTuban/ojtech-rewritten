package com.ojtech.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileUploadService {
    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folderName) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file.");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap(
                    "folder", folderName, // e.g. "ojtech/cvs", "ojtech/logos"
                    "public_id", UUID.randomUUID().toString(), // Generates a unique public ID
                    "resource_type", "auto" // auto-detects image, pdf, etc.
            ));
            logger.info("File uploaded successfully to Cloudinary: {}", uploadResult.get("secure_url"));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            logger.error("Failed to upload file to Cloudinary", e);
            throw new IOException("Failed to upload file: " + file.getOriginalFilename(), e);
        }
    }

    // You can add methods for deleting or updating files if needed
    public boolean deleteFile(String publicId) throws IOException {
        try {
            Map<?,?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            logger.info("File deleted from Cloudinary: {}. Result: {}", publicId, result.get("result"));
            return "ok".equals(result.get("result")) || "not found".equals(result.get("result"));
        } catch (IOException e) {
            logger.error("Failed to delete file from Cloudinary: {}", publicId, e);
            throw new IOException("Failed to delete file: " + publicId, e);
        }
    }
    
    // Helper to extract public ID from URL if you store the full URL
    public String extractPublicIdFromUrl(String url) {
        try {
            // Example URL: http://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
            // We need "folder/public_id"
            String[] parts = url.split("/");
            String versionAndFolderAndIdWithExt = parts[parts.length-3] + "/" + parts[parts.length-2] + "/" + parts[parts.length-1];
            String publicIdWithFolder = versionAndFolderAndIdWithExt.substring(versionAndFolderAndIdWithExt.indexOf('/') + 1, versionAndFolderAndIdWithExt.lastIndexOf('.'));
            if (publicIdWithFolder.startsWith(parts[parts.length-3])) { // if version is not part of folder name
                 publicIdWithFolder = publicIdWithFolder.substring(publicIdWithFolder.indexOf('/') +1);
            }
            // Check if the folder part is actually the version number (e.g., v1234567890)
            if (parts[parts.length-3].matches("v\\d+")) {
                 // The actual public ID is folder/name
                 return parts[parts.length-2] + "/" + parts[parts.length-1].substring(0, parts[parts.length-1].lastIndexOf('.'));
            } else {
                // The public ID is cloud_name/folder/name if version is not present or folder is the first part
                 return parts[parts.length-3] + "/" + parts[parts.length-2] + "/" + parts[parts.length-1].substring(0, parts[parts.length-1].lastIndexOf('.'));
            }
        } catch (Exception e) {
            logger.error("Could not extract public_id from url: {}", url, e);
            return null;
        }
    }
} 