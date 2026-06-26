package com.nexacart.backend.modules.cart.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.cart.dto.WishlistResponse;
import com.nexacart.backend.modules.cart.model.Wishlist;
import com.nexacart.backend.modules.cart.repository.WishlistRepository;
import com.nexacart.backend.modules.product.model.Product;
import com.nexacart.backend.modules.product.repository.ProductRepository;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WishlistResponse addToWishlist(Long productId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Product is already in your wishlist");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);
        log.info("Product added to wishlist: ProductId={}, User={}", productId, email);
        return mapToWishlistResponse(saved);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long productId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));

        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found in your wishlist"));

        wishlistRepository.delete(wishlist);
        log.info("Product removed from wishlist: ProductId={}, User={}", productId, email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(String email) {
        List<Wishlist> wishlist = wishlistRepository.findByUserEmail(email);
        return wishlist.stream().map(this::mapToWishlistResponse).collect(Collectors.toList());
    }

    private WishlistResponse mapToWishlistResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        String imgUrl = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            imgUrl = product.getImages().get(0).getUrl();
        }

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .price(product.getPrice())
                .imageUrl(imgUrl)
                .build();
    }
}
