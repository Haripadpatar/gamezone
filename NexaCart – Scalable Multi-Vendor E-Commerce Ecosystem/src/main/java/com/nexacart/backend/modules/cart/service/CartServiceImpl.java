package com.nexacart.backend.modules.cart.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.cart.dto.CartItemRequest;
import com.nexacart.backend.modules.cart.dto.CartItemResponse;
import com.nexacart.backend.modules.cart.dto.CartResponse;
import com.nexacart.backend.modules.cart.model.Cart;
import com.nexacart.backend.modules.cart.model.CartItem;
import com.nexacart.backend.modules.cart.repository.CartItemRepository;
import com.nexacart.backend.modules.cart.repository.CartRepository;
import com.nexacart.backend.modules.product.model.ProductVariant;
import com.nexacart.backend.modules.product.repository.ProductVariantRepository;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponse getMyCart(String email) {
        Cart cart = getOrCreateCart(email);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(CartItemRequest request, String email) {
        Cart cart = getOrCreateCart(email);
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product variant not found"));

        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(request.getProductVariantId()))
                .findFirst().orElse(null);

        int newQuantity = request.getQuantity();
        if (existingItem != null) {
            newQuantity += existingItem.getQuantity();
        }

        // Validate stock
        if (variant.getInventory() != null && variant.getInventory().getStockQuantity() < newQuantity) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Insufficient stock. Available: " 
                    + variant.getInventory().getStockQuantity());
        }

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.getCartItems().add(item);
        }

        Cart saved = cartRepository.save(cart);
        log.info("Product variant added to cart: SKU={}, User={}", variant.getSku(), email);
        return mapToCartResponse(saved);
    }

    @Override
    @Transactional
    public CartResponse updateCartItemQuantity(Long productVariantId, int quantity, String email) {
        Cart cart = getOrCreateCart(email);
        ProductVariant variant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product variant not found"));

        CartItem item = cart.getCartItems().stream()
                .filter(i -> i.getProductVariant().getId().equals(productVariantId))
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Item not found in cart"));

        // Validate stock
        if (variant.getInventory() != null && variant.getInventory().getStockQuantity() < quantity) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Insufficient stock. Available: " 
                    + variant.getInventory().getStockQuantity());
        }

        item.setQuantity(quantity);
        Cart saved = cartRepository.save(cart);
        log.info("Cart item quantity updated: SKU={}, Quantity={}, User={}", variant.getSku(), quantity, email);
        return mapToCartResponse(saved);
    }

    @Override
    @Transactional
    public CartResponse removeFromCart(Long productVariantId, String email) {
        Cart cart = getOrCreateCart(email);
        boolean removed = cart.getCartItems().removeIf(item -> item.getProductVariant().getId().equals(productVariantId));
        
        if (!removed) {
            throw new AppException(HttpStatus.NOT_FOUND, "Item not found in cart");
        }

        Cart saved = cartRepository.save(cart);
        log.info("Product variant removed from cart: VariantId={}, User={}", productVariantId, email);
        return mapToCartResponse(saved);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getCartItems().clear();
        cartRepository.save(cart);
        log.info("Cleared cart for user: {}", email);
    }

    @Override
    @Transactional
    public CartResponse syncGuestCart(List<CartItemRequest> items, String email) {
        CartResponse cartResponse = null;
        if (items != null) {
            for (CartItemRequest item : items) {
                cartResponse = addToCart(item, email);
            }
        }
        return cartResponse != null ? cartResponse : getMyCart(email);
    }

    private Cart getOrCreateCart(String email) {
        return cartRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> items = new ArrayList<>();
        int totalItems = 0;
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (cart.getCartItems() != null) {
            for (CartItem item : cart.getCartItems()) {
                ProductVariant variant = item.getProductVariant();
                BigDecimal itemPrice = variant.getProduct().getPrice().add(variant.getPriceModifier());
                BigDecimal subTotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                totalItems += item.getQuantity();
                totalPrice = totalPrice.add(subTotal);

                // Find primary image if present
                String imgUrl = null;
                if (variant.getProduct().getImages() != null && !variant.getProduct().getImages().isEmpty()) {
                    imgUrl = variant.getProduct().getImages().stream()
                            .filter(i -> i.isPrimary())
                            .map(i -> i.getUrl())
                            .findFirst()
                            .orElse(variant.getProduct().getImages().get(0).getUrl());
                }

                items.add(CartItemResponse.builder()
                        .id(item.getId())
                        .productVariantId(variant.getId())
                        .sku(variant.getSku())
                        .productName(variant.getProduct().getName())
                        .productSlug(variant.getProduct().getSlug())
                        .size(variant.getSize())
                        .color(variant.getColor())
                        .price(itemPrice)
                        .quantity(item.getQuantity())
                        .subTotal(subTotal)
                        .build());
            }
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }
}
