package com.nexacart.backend.modules.vendor.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.vendor.dto.VendorResponse;
import com.nexacart.backend.modules.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/vendors")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminVendorController {

    private final VendorService vendorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorResponse>>> getVendors(
            @RequestParam(value = "status", defaultValue = "ALL") String status) {
        List<VendorResponse> response = vendorService.getVendorsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(response, "Vendors retrieved successfully"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<VendorResponse>> approveVendor(
            @PathVariable Long id,
            @RequestParam(value = "approved") boolean approved) {
        VendorResponse response = vendorService.approveVendor(id, approved);
        String message = approved ? "Vendor approved successfully" : "Vendor application rejected";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }
}
