package com.nonvegshop.delivery.controller;

import com.nonvegshop.delivery.dto.ProductDTO;
import com.nonvegshop.delivery.entity.Product;
import com.nonvegshop.delivery.service.CloudinaryService;
import com.nonvegshop.delivery.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.nonvegshop.delivery.entity.User;
import com.nonvegshop.delivery.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Map;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserRepository userRepository;

    // Public endpoints
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/products/restaurant/{restaurantId}")
    public ResponseEntity<List<Product>> getProductsByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(productService.getProductsByRestaurant(restaurantId));
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "categoryId", required = false) Long categoryId) {
        return ResponseEntity.ok(productService.searchProducts(query, categoryId));
    }

    // Admin endpoints
    @GetMapping("/admin/products")
    public ResponseEntity<List<Product>> getAdminProducts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByPhone(userDetails.getUsername()).orElseThrow();
        if ("MERCHANT".equals(user.getRole())) {
            return ResponseEntity.ok(productService.getProductsByRestaurant(user.getRestaurant().getId()));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping("/admin/products")
    public ResponseEntity<Product> createProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProductDTO productDTO) {
        User user = userRepository.findByPhone(userDetails.getUsername()).orElseThrow();
        Long restaurantId = null;
        if ("MERCHANT".equals(user.getRole())) {
            restaurantId = user.getRestaurant().getId();
        } else if (productDTO.getRestaurantId() != null) {
            restaurantId = productDTO.getRestaurantId();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productDTO, restaurantId));
    }

    @PutMapping("/admin/products/{id}")
    public ResponseEntity<Product> updateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id, 
            @Valid @RequestBody ProductDTO productDTO) {
        User user = userRepository.findByPhone(userDetails.getUsername()).orElseThrow();
        Long restaurantId = null;
        if ("MERCHANT".equals(user.getRole())) {
            restaurantId = user.getRestaurant().getId();
        } else if (productDTO.getRestaurantId() != null) {
            restaurantId = productDTO.getRestaurantId();
        }
        return ResponseEntity.ok(productService.updateProduct(id, productDTO, restaurantId));
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/products/upload-image")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) {
        String imageUrl = cloudinaryService.uploadImage(file, productName);
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }
}
