package com.antigravity.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "referral_code", unique = true, nullable = false, length = 20)
    private String referralCode;

    @Column(name = "referred_by", length = 20)
    private String referredBy;

    @Column(name = "vip_tier")
    private String vipTier = "BRONZE";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "role")
    private String role = "USER";

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "phone_verified")
    private Boolean phoneVerified = false;

    @Column(name = "kyc_status")
    private String kycStatus = "UNVERIFIED";

    @Column(name = "security_2fa")
    private Boolean security2Fa = false;
}
