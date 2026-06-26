package com.nexacart.backend.modules.cart.service;

import com.nexacart.backend.modules.cart.dto.CartItemRequest;
import com.nexacart.backend.modules.cart.dto.CartResponse;

import java.util.List;

public interface CartService {
    
    CartResponse getMyCart(String email);
    
    CartResponse addToCart(CartItemRequest request, String email);
    
    CartResponse updateCartItemQuantity(Long productVariantId, int quantity, String email);
    
    CartResponse removeFromCart(Long productVariantId, String email);
    
    void clearCart(String email);
    
    CartResponse syncGuestCart(List<CartItemRequest> items, String email);
}
