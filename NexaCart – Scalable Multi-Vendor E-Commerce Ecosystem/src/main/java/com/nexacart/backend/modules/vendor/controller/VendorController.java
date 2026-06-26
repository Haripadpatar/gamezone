package com.nexacart.backend.modules.vendor.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.vendor.dto.StoreResponse;
import com.nexacart.backend.modules.vendor.dto.StoreUpdateRequest;
import com.nexacart.backend.modules.vendor.dto.VendorRegisterRequest;
import com.nexacart.backend.modules.vendor.dto.VendorResponse;
import com.nexacart.backend.modules.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<VendorResponse>> registerVendor(
            @Valid @RequestBody VendorRegisterRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        VendorResponse response = vendorService.applyToBeVendor(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Vendor application submitted successfully"));
    }

    @GetMapping("/my-store")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<StoreResponse>> getMyStore(@AuthenticationPrincipal UserDetails userDetails) {
        StoreResponse response = vendorService.getMyStore(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Store retrieved successfully"));
    }

    @PutMapping("/my-store")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<StoreResponse>> updateMyStore(
            @Valid @RequestBody StoreUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        StoreResponse response = vendorService.updateMyStore(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Store updated successfully"));
    }

    @GetMapping("/stores/{id}")
    public ResponseEntity<ApiResponse<StoreResponse>> getStoreById(@PathVariable Long id) {
        StoreResponse response = vendorService.getStoreById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Store retrieved successfully"));
    }
}
