package com.nexacart.backend.modules.product.repository;

import com.nexacart.backend.modules.product.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findBySku(String sku);
    Boolean existsBySku(String sku);
}
