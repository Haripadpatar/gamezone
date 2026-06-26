package com.nexacart.backend.modules.analytics.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.analytics.dto.AdminAnalyticsResponse;
import com.nexacart.backend.modules.analytics.dto.VendorAnalyticsResponse;
import com.nexacart.backend.modules.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/vendor/analytics")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<VendorAnalyticsResponse>> getVendorAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        VendorAnalyticsResponse response = analyticsService.getVendorAnalytics(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Vendor analytics retrieved successfully"));
    }

    @GetMapping("/admin/analytics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAdminAnalytics() {
        AdminAnalyticsResponse response = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.success(response, "Admin analytics retrieved successfully"));
    }
}
