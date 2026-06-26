package com.nexacart.backend.modules.product.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.product.dto.ProductResponse;
import com.nexacart.backend.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ProductResponse>> approveProduct(
            @PathVariable Long id,
            @RequestParam(value = "approved") boolean approved) {
        ProductResponse response = productService.approveProduct(id, approved);
        String message = approved ? "Product approved successfully" : "Product rejected/disapproved";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }
}
