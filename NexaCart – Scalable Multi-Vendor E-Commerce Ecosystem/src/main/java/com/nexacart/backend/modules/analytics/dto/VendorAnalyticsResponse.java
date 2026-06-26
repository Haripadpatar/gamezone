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
public class VendorAnalyticsResponse {
    private BigDecimal totalEarnings;
    private Long totalOrders;
    private Long totalProductsSold;
    private Long lowStockAlerts;
    private List<SalesDataPoint> salesHistory;
}
