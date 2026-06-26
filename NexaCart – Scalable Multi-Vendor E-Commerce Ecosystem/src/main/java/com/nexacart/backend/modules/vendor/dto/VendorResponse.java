package com.nexacart.backend.modules.vendor.dto;

import com.nexacart.backend.modules.vendor.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponse {
    private Long id;
    private Long userId;
    private String email;
    private String businessName;
    private String taxId;
    private VerificationStatus verificationStatus;
    private String bankDetails;
    private LocalDateTime createdAt;
}
