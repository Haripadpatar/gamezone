package com.nexacart.backend.modules.analytics.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.analytics.dto.AdminAnalyticsResponse;
import com.nexacart.backend.modules.analytics.dto.SalesDataPoint;
import com.nexacart.backend.modules.analytics.dto.VendorAnalyticsResponse;
import com.nexacart.backend.modules.order.repository.OrderItemRepository;
import com.nexacart.backend.modules.order.repository.OrderRepository;
import com.nexacart.backend.modules.product.repository.InventoryRepository;
import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.repository.UserRepository;
import com.nexacart.backend.modules.vendor.model.Store;
import com.nexacart.backend.modules.vendor.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "vendor_analytics", key = "#vendorEmail")
    public VendorAnalyticsResponse getVendorAnalytics(String vendorEmail) {
        Store store = storeRepository.findByVendorUserEmail(vendorEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Store not found for this account"));

        List<Object[]> metricsList = orderItemRepository.findVendorMetricsByStoreId(store.getId());
        Object[] metrics = !metricsList.isEmpty() ? metricsList.get(0) : new Object[]{BigDecimal.ZERO, 0L, 0L};
        BigDecimal totalEarnings = metrics[0] != null ? (BigDecimal) metrics[0] : BigDecimal.ZERO;
        Long totalProductsSold = metrics[1] != null ? ((Number) metrics[1]).longValue() : 0L;
        Long totalOrders = metrics[2] != null ? ((Number) metrics[2]).longValue() : 0L;

        Long lowStockAlerts = inventoryRepository.countLowStockByStoreId(store.getId());

        List<Object[]> monthlySalesData = orderItemRepository.findMonthlySalesByStoreId(store.getId());
        List<SalesDataPoint> salesHistory = monthlySalesData.stream().map(row -> {
            Integer year = ((Number) row[0]).intValue();
            Integer month = ((Number) row[1]).intValue();
            BigDecimal sales = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            return new SalesDataPoint(String.format("%04d-%02d", year, month), sales);
        }).collect(Collectors.toList());

        return VendorAnalyticsResponse.builder()
                .totalEarnings(totalEarnings)
                .totalProductsSold(totalProductsSold)
                .totalOrders(totalOrders)
                .lowStockAlerts(lowStockAlerts)
                .salesHistory(salesHistory)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "admin_analytics", key = "'dashboard'")
    public AdminAnalyticsResponse getAdminAnalytics() {
        List<Object[]> metricsList = orderRepository.findGlobalMetrics();
        Object[] metrics = !metricsList.isEmpty() ? metricsList.get(0) : new Object[]{BigDecimal.ZERO, BigDecimal.ZERO, 0L};
        BigDecimal totalRevenue = metrics[0] != null ? (BigDecimal) metrics[0] : BigDecimal.ZERO;
        BigDecimal totalCommission = metrics[1] != null ? (BigDecimal) metrics[1] : BigDecimal.ZERO;
        Long totalOrders = metrics[2] != null ? ((Number) metrics[2]).longValue() : 0L;

        Long totalVendors = userRepository.countByRoleName(ERole.ROLE_VENDOR);
        Long totalCustomers = userRepository.countByRoleName(ERole.ROLE_CUSTOMER);
        Long totalActiveStores = storeRepository.count();

        List<Object[]> monthlySalesData = orderRepository.findMonthlyPlatformSales();
        List<SalesDataPoint> platformSalesHistory = monthlySalesData.stream().map(row -> {
            Integer year = ((Number) row[0]).intValue();
            Integer month = ((Number) row[1]).intValue();
            BigDecimal sales = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            return new SalesDataPoint(String.format("%04d-%02d", year, month), sales);
        }).collect(Collectors.toList());

        return AdminAnalyticsResponse.builder()
                .totalPlatformRevenue(totalRevenue)
                .totalCommissionEarned(totalCommission)
                .totalOrders(totalOrders)
                .totalVendors(totalVendors)
                .totalCustomers(totalCustomers)
                .totalActiveStores(totalActiveStores)
                .platformSalesHistory(platformSalesHistory)
                .build();
    }
}
