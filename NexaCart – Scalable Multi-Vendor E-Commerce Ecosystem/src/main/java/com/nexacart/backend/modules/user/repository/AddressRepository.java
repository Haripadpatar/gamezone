package com.nexacart.backend.modules.user.repository;

import com.nexacart.backend.modules.user.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    List<Address> findByUserEmail(String email);
}
