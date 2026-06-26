package com.nexacart.backend.modules.analytics.service;

import com.nexacart.backend.modules.analytics.dto.AdminAnalyticsResponse;
import com.nexacart.backend.modules.analytics.dto.VendorAnalyticsResponse;

public interface AnalyticsService {
    VendorAnalyticsResponse getVendorAnalytics(String vendorEmail);
    AdminAnalyticsResponse getAdminAnalytics();
}
