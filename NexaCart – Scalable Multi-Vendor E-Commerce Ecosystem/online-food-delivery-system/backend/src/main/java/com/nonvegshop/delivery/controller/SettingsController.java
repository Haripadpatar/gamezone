package com.nonvegshop.delivery.controller;

import com.nonvegshop.delivery.dto.SettingsDTO;
import com.nonvegshop.delivery.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping("/settings/public")
    public ResponseEntity<SettingsDTO> getPublicSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @GetMapping("/admin/settings")
    public ResponseEntity<SettingsDTO> getAdminSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/admin/settings")
    public ResponseEntity<SettingsDTO> updateSettings(@Valid @RequestBody SettingsDTO settingsDTO) {
        return ResponseEntity.ok(settingsService.saveSettings(settingsDTO));
    }
}
