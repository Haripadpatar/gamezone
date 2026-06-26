package com.nexacart.backend.modules.cart.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.cart.dto.WishlistResponse;
import com.nexacart.backend.modules.cart.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getMyWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<WishlistResponse> response = wishlistService.getMyWishlist(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Wishlist retrieved successfully"));
    }

    @PostMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        WishlistResponse response = wishlistService.addToWishlist(productId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Product added to wishlist successfully"));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        wishlistService.removeFromWishlist(productId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Product removed from wishlist successfully"));
    }
}
