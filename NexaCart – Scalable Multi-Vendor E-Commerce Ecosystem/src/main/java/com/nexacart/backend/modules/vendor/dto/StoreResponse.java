package com.nexacart.backend.modules.vendor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {
    private Long id;
    private Long vendorId;
    private String vendorBusinessName;
    private String name;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private BigDecimal commissionRate;
}
