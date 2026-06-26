package com.nexacart.backend.modules.cart.repository;

import com.nexacart.backend.modules.cart.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
    Optional<Cart> findByUserEmail(String email);
}
