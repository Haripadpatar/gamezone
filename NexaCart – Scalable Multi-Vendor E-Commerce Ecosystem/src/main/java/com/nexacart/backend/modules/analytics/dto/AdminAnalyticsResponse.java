package com.nexacart.backend.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private BigDecimal totalPlatformRevenue;
    private BigDecimal totalCommissionEarned;
    private Long totalOrders;
    private Long totalVendors;
    private Long totalCustomers;
    private Long totalActiveStores;
    private List<SalesDataPoint> platformSalesHistory;
}
