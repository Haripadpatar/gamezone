package com.nexacart.backend.modules.vendor.repository;

import com.nexacart.backend.modules.vendor.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByVendorId(Long vendorId);
    Optional<Store> findByVendorUserEmail(String email);
    Boolean existsByName(String name);
}
