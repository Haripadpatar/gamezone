package com.nexacart.backend.modules.product.repository;

import com.nexacart.backend.modules.product.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductVariantId(Long productVariantId);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.productVariant.product.store.id = :storeId AND i.stockQuantity <= i.lowStockThreshold")
    long countLowStockByStoreId(@Param("storeId") Long storeId);
}
