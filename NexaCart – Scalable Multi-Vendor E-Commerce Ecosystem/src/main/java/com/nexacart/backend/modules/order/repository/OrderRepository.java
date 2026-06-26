package com.nexacart.backend.modules.order.repository;

import com.nexacart.backend.modules.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmail(String email);
    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0), COALESCE(SUM(o.platformCommission), 0), COUNT(o.id) FROM Order o " +
           "WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')")
    List<Object[]> findGlobalMetrics();

    @Query("SELECT YEAR(o.createdAt), MONTH(o.createdAt), SUM(o.totalAmount) FROM Order o " +
           "WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
           "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) " +
           "ORDER BY YEAR(o.createdAt) DESC, MONTH(o.createdAt) DESC")
    List<Object[]> findMonthlyPlatformSales();
}
