package com.nonvegshop.delivery.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;
    private boolean isConfigured = false;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.trim().isEmpty() &&
            apiKey != null && !apiKey.trim().isEmpty() &&
            apiSecret != null && !apiSecret.trim().isEmpty()) {
            try {
                cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret
                ));
                isConfigured = true;
                logger.info("Cloudinary successfully configured.");
            } catch (Exception e) {
                logger.error("Failed to initialize Cloudinary: {}", e.getMessage());
            }
        } else {
            logger.warn("Cloudinary credentials are not configured. Falling back to mock image upload.");
        }
    }

    public String uploadImage(MultipartFile file, String productName) {
        if (file == null || file.isEmpty()) {
            return getMockImageUrl(productName);
        }

        if (isConfigured) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "non_veg_shop",
                        "public_id", productName.replaceAll("[^a-zA-Z0-9]", "_") + "_" + System.currentTimeMillis()
                ));
                return uploadResult.get("secure_url").toString();
            } catch (IOException e) {
                logger.error("Error uploading image to Cloudinary: {}", e.getMessage());
                // Fallback to mock on upload error
                return getMockImageUrl(productName);
            }
        } else {
            return getMockImageUrl(productName);
        }
    }

    public String getMockImageUrl(String productName) {
        String name = productName != null ? productName.toLowerCase() : "";
        if (name.contains("chicken")) {
            return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80"; // raw chicken breast
        } else if (name.contains("mutton") || name.contains("lamb") || name.contains("goat")) {
            return "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80"; // raw lamb chops
        } else if (name.contains("fish") || name.contains("salmon") || name.contains("prawn") || name.contains("sea")) {
            return "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&auto=format&fit=crop&q=80"; // fresh fish
        } else if (name.contains("egg")) {
            return "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&auto=format&fit=crop&q=80"; // brown eggs
        } else {
            return "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"; // generic meat platter
        }
    }
}
