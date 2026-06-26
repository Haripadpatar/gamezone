package com.nonvegshop.delivery.service;

import com.nonvegshop.delivery.dto.SettingsDTO;
import com.nonvegshop.delivery.entity.ShopSetting;
import com.nonvegshop.delivery.repository.ShopSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    @Autowired
    private ShopSettingRepository shopSettingRepository;

    @org.springframework.beans.factory.annotation.Value("${google.maps.api-key:}")
    private String googleApiKey;

    public SettingsDTO getSettings() {
        SettingsDTO dto = new SettingsDTO();
        dto.setShopName(getSetting("shop_name", "FreshCut Non-Veg Hub"));
        dto.setShopAddress(getSetting("shop_address", "123 Market Road, Bangalore, Karnataka, India"));
        dto.setShopLatLng(getSetting("shop_lat_lng", "12.9716,77.5946"));
        dto.setShopPhone(getSetting("shop_phone", "+919876543210"));
        dto.setDeliveryHours(getSetting("delivery_hours", "08:00 AM - 09:00 PM"));
        dto.setDeliveryFee0To3(getSetting("delivery_fee_0_3", "50"));
        dto.setDeliveryFee3To6(getSetting("delivery_fee_3_6", "80"));
        dto.setDeliveryFee6To10(getSetting("delivery_fee_6_10", "120"));
        dto.setGoogleMapsApiKey(googleApiKey);
        return dto;
    }

    @Transactional
    public SettingsDTO saveSettings(SettingsDTO dto) {
        saveSetting("shop_name", dto.getShopName());
        saveSetting("shop_address", dto.getShopAddress());
        saveSetting("shop_lat_lng", dto.getShopLatLng());
        saveSetting("shop_phone", dto.getShopPhone());
        saveSetting("delivery_hours", dto.getDeliveryHours());
        saveSetting("delivery_fee_0_3", dto.getDeliveryFee0To3());
        saveSetting("delivery_fee_3_6", dto.getDeliveryFee3To6());
        saveSetting("delivery_fee_6_10", dto.getDeliveryFee6To10());
        return getSettings();
    }

    private String getSetting(String key, String defaultValue) {
        return shopSettingRepository.findById(key)
                .map(ShopSetting::getValue)
                .orElse(defaultValue);
    }

    private void saveSetting(String key, String value) {
        if (value != null) {
            ShopSetting setting = new ShopSetting(key, value.trim());
            shopSettingRepository.save(setting);
        }
    }
}
