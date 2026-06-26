package com.nexacart.backend.modules.product.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.product.dto.CategoryRequest;
import com.nexacart.backend.modules.product.dto.CategoryResponse;
import com.nexacart.backend.modules.product.model.Category;
import com.nexacart.backend.modules.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Category name already exists");
        }

        String slug = generateSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Category slug already exists");
        }

        Category parent = null;
        if (request.getParentSlug() != null && !request.getParentSlug().isBlank()) {
            parent = categoryRepository.findBySlug(request.getParentSlug())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .parent(parent)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: {}", saved.getName());
        return mapToCategoryResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'hierarchy'")
    public List<CategoryResponse> getCategoryHierarchy() {
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream().map(this::mapToCategoryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Category not found"));
        return mapToCategoryResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(String slug, CategoryRequest request) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Category name already exists");
        }

        category.setName(request.getName());
        category.setSlug(generateSlug(request.getName()));

        Category parent = null;
        if (request.getParentSlug() != null && !request.getParentSlug().isBlank()) {
            parent = categoryRepository.findBySlug(request.getParentSlug())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Parent category not found"));
            
            // Prevent circular referencing
            if (parent.getId().equals(category.getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Category cannot be its own parent");
            }
        }
        category.setParent(parent);

        Category updated = categoryRepository.save(category);
        log.info("Category updated: {}", updated.getName());
        return mapToCategoryResponse(updated);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Category not found"));
        categoryRepository.delete(category);
        log.info("Category deleted with slug: {}", slug);
    }

    private String generateSlug(String input) {
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .parentSlug(category.getParent() != null ? category.getParent().getSlug() : null)
                .subcategories(category.getSubcategories().stream()
                        .map(this::mapToCategoryResponse)
                        .collect(Collectors.toList()))
                .build();
    }
}
