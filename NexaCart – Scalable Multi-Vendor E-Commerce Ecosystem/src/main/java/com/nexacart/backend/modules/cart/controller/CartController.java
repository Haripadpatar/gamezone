package com.nexacart.backend.modules.cart.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.cart.dto.CartItemRequest;
import com.nexacart.backend.modules.cart.dto.CartResponse;
import com.nexacart.backend.modules.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(@AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.getMyCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Cart retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.addToCart(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Item added to cart successfully"));
    }

    @PutMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItemQuantity(
            @PathVariable Long variantId,
            @RequestParam int quantity,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.updateCartItemQuantity(variantId, quantity, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Cart quantity updated successfully"));
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable Long variantId,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.removeFromCart(variantId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Item removed from cart successfully"));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<CartResponse>> syncGuestCart(
            @RequestBody List<CartItemRequest> items,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.syncGuestCart(items, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Guest cart synced successfully"));
    }
}
