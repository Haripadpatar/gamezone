package com.nexacart.backend.modules.user.repository;

import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByRoleName(ERole name);
}
