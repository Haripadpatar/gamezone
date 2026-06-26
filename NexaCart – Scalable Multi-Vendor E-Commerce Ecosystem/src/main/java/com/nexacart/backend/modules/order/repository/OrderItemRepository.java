package com.nexacart.backend.modules.order.repository;

import com.nexacart.backend.modules.order.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByStoreId(Long storeId);
    List<OrderItem> findByStoreVendorUserEmail(String email);

    @Query("SELECT COALESCE(SUM(oi.price * oi.quantity), 0), COALESCE(SUM(oi.quantity), 0), COUNT(DISTINCT oi.order.id) FROM OrderItem oi " +
           "WHERE oi.store.id = :storeId AND oi.order.status IN ('PAID', 'SHIPPED', 'DELIVERED')")
    List<Object[]> findVendorMetricsByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT YEAR(oi.order.createdAt), MONTH(oi.order.createdAt), SUM(oi.price * oi.quantity) FROM OrderItem oi " +
           "WHERE oi.store.id = :storeId AND oi.order.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
           "GROUP BY YEAR(oi.order.createdAt), MONTH(oi.order.createdAt) " +
           "ORDER BY YEAR(oi.order.createdAt) DESC, MONTH(oi.order.createdAt) DESC")
    List<Object[]> findMonthlySalesByStoreId(@Param("storeId") Long storeId);
}
