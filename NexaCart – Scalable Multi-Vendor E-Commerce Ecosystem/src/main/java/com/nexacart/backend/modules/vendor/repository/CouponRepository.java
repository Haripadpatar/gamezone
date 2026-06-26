package com.nexacart.backend.modules.vendor.repository;

import com.nexacart.backend.modules.vendor.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
}
