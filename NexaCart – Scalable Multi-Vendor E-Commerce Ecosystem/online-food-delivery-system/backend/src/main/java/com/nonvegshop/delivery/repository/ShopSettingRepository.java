package com.nonvegshop.delivery.repository;

import com.nonvegshop.delivery.entity.ShopSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShopSettingRepository extends JpaRepository<ShopSetting, String> {
}
