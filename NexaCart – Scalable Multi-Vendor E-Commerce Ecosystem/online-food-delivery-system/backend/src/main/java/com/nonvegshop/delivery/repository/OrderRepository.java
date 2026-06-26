package com.nonvegshop.delivery.repository;

import com.nonvegshop.delivery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByPhoneOrderByCreatedAtDesc(String phone);
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}
