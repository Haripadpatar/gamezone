package com.nexacart.backend.modules.product.service;

import com.nexacart.backend.modules.product.dto.ProductCreateRequest;
import com.nexacart.backend.modules.product.dto.ProductResponse;
import com.nexacart.backend.modules.product.dto.ProductUpdateRequest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface ProductService {
    
    ProductResponse createProduct(ProductCreateRequest request, String vendorEmail);
    
    ProductResponse updateProduct(String slug, ProductUpdateRequest request, String vendorEmail);
    
    void deleteProduct(String slug, String vendorEmail);
    
    ProductResponse approveProduct(Long productId, boolean approve);
    
    ProductResponse getProductBySlug(String slug);
    
    Page<ProductResponse> getProductsForVendor(String vendorEmail, int page, int size);
    
    Page<ProductResponse> searchProducts(String keyword, String categorySlug, BigDecimal minPrice, BigDecimal maxPrice,
                                         String size, String color, int page, int sizeCount, String sortBy, String sortDir);
}
