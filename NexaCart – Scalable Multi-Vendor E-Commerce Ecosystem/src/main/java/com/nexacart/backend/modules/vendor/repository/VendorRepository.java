package com.nexacart.backend.modules.vendor.repository;

import com.nexacart.backend.modules.vendor.model.Vendor;
import com.nexacart.backend.modules.vendor.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByUserId(Long userId);
    Optional<Vendor> findByUserEmail(String email);
    List<Vendor> findByVerificationStatus(VerificationStatus status);
}
