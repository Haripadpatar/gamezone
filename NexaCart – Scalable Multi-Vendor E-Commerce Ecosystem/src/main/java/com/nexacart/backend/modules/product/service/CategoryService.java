package com.nexacart.backend.modules.product.service;

import com.nexacart.backend.modules.product.dto.CategoryRequest;
import com.nexacart.backend.modules.product.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    
    CategoryResponse createCategory(CategoryRequest request);
    
    List<CategoryResponse> getCategoryHierarchy();
    
    CategoryResponse getCategoryBySlug(String slug);
    
    CategoryResponse updateCategory(String slug, CategoryRequest request);
    
    void deleteCategory(String slug);
}
