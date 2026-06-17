package com.antigravity.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    
    // Robust fallback in-memory store in case Redis is not available
    private final Map<String, String> localOtpCache = new ConcurrentHashMap<>();
    private final Map<String, Long> localOtpExpiry = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public OtpService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generateOtp(String key) {
        String otp = String.format("%06d", random.nextInt(900000) + 100000);
        
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set("OTP_" + key, otp, 5, TimeUnit.MINUTES);
                return otp;
            }
        } catch (Exception e) {
            // Log warning and fallback
        }
        
        // Fallback to in-memory store with 5 minutes TTL
        localOtpCache.put(key, otp);
        localOtpExpiry.put(key, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5));
        return otp;
    }

    public boolean verifyOtp(String key, String code) {
        if (code == null) return false;
        
        try {
            if (redisTemplate != null) {
                String savedOtp = redisTemplate.opsForValue().get("OTP_" + key);
                if (code.equals(savedOtp)) {
                    redisTemplate.delete("OTP_" + key);
                    return true;
                }
                return false;
            }
        } catch (Exception e) {
            // Log warning and fallback
        }
        
        // Fallback check
        String savedOtp = localOtpCache.get(key);
        Long expiry = localOtpExpiry.get(key);
        if (savedOtp != null && expiry != null && expiry > System.currentTimeMillis()) {
            if (code.equals(savedOtp)) {
                localOtpCache.remove(key);
                localOtpExpiry.remove(key);
                return true;
            }
        }
        return false;
    }
}
