package com.nexacart.backend.modules.product.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.product.dto.ProductCreateRequest;
import com.nexacart.backend.modules.product.dto.ProductResponse;
import com.nexacart.backend.modules.product.dto.ProductUpdateRequest;
import com.nexacart.backend.modules.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String categorySlug,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "size", required = false) String size,
            @RequestParam(value = "color", required = false) String color,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "sizeCount", defaultValue = "10") int sizeCount,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        Page<ProductResponse> products = productService.searchProducts(
                keyword, categorySlug, minPrice, maxPrice, size, color, page, sizeCount, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response, "Product retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProductResponse response = productService.createProduct(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Product created successfully"));
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String slug,
            @Valid @RequestBody ProductUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProductResponse response = productService.updateProduct(slug, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated successfully"));
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails userDetails) {
        productService.deleteProduct(slug, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getMyStoreProducts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Page<ProductResponse> products = productService.getProductsForVendor(userDetails.getUsername(), page, size);
        return ResponseEntity.ok(ApiResponse.success(products, "Vendor products retrieved successfully"));
    }
}
