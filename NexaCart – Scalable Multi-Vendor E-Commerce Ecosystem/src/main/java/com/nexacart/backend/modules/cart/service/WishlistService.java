package com.nexacart.backend.modules.cart.service;

import com.nexacart.backend.modules.cart.dto.WishlistResponse;

import java.util.List;

public interface WishlistService {
    
    WishlistResponse addToWishlist(Long productId, String email);
    
    void removeFromWishlist(Long productId, String email);
    
    List<WishlistResponse> getMyWishlist(String email);
}
