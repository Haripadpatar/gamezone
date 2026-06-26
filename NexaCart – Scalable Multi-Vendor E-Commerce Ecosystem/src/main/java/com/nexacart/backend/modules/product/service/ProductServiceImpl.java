package com.nexacart.backend.modules.product.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.product.dto.*;
import com.nexacart.backend.modules.product.model.*;
import com.nexacart.backend.modules.product.repository.CategoryRepository;
import com.nexacart.backend.modules.product.repository.ProductRepository;
import com.nexacart.backend.modules.vendor.model.Store;
import com.nexacart.backend.modules.vendor.repository.StoreRepository;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, String vendorEmail) {
        Store store = storeRepository.findByVendorUserEmail(vendorEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Store not found for this account"));

        Category category = categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Category not found"));

        String slug = generateSlug(request.getName());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + (System.currentTimeMillis() % 10000);
        }

        Product product = Product.builder()
                .store(store)
                .category(category)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .isApproved(false)
                .isActive(true)
                .build();

        // Map Images
        if (request.getImages() != null) {
            for (ProductImageDto imgDto : request.getImages()) {
                product.getImages().add(ProductImage.builder()
                        .product(product)
                        .url(imgDto.getUrl())
                        .isPrimary(imgDto.isPrimary())
                        .build());
            }
        }

        // Map Variants & Inventory
        if (request.getVariants() != null) {
            for (ProductVariantDto varDto : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(varDto.getSku())
                        .size(varDto.getSize())
                        .color(varDto.getColor())
                        .priceModifier(varDto.getPriceModifier())
                        .build();

                Inventory inventory = Inventory.builder()
                        .productVariant(variant)
                        .stockQuantity(varDto.getStockQuantity())
                        .lowStockThreshold(varDto.getLowStockThreshold())
                        .build();

                variant.setInventory(inventory);
                product.getVariants().add(variant);
            }
        }

        Product saved = productRepository.save(product);
        log.info("Product created: {}, awaiting admin approval", saved.getName());
        return mapToProductResponse(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", key = "#slug"),
        @CacheEvict(value = "products", key = "#result.slug", condition = "#result != null")
    })
    public ProductResponse updateProduct(String slug, ProductUpdateRequest request, String vendorEmail) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getStore().getVendor().getUser().getEmail().equals(vendorEmail)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this product");
        }

        Category category = categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!product.getName().equalsIgnoreCase(request.getName())) {
            String newSlug = generateSlug(request.getName());
            if (productRepository.existsBySlug(newSlug)) {
                newSlug = newSlug + "-" + (System.currentTimeMillis() % 10000);
            }
            product.setSlug(newSlug);
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setActive(request.isActive());
        // Require re-approval when vendor updates details
        product.setApproved(false);

        // Update Images
        product.getImages().clear();
        if (request.getImages() != null) {
            for (ProductImageDto imgDto : request.getImages()) {
                product.getImages().add(ProductImage.builder()
                        .product(product)
                        .url(imgDto.getUrl())
                        .isPrimary(imgDto.isPrimary())
                        .build());
            }
        }

        // Smart Update Variants & Inventory
        List<ProductVariant> existingVariants = product.getVariants();
        List<ProductVariantDto> requestedVariants = request.getVariants();

        if (requestedVariants != null) {
            Map<String, ProductVariantDto> reqMap = requestedVariants.stream()
                    .collect(Collectors.toMap(ProductVariantDto::getSku, v -> v));

            // Remove non-present variants
            existingVariants.removeIf(v -> !reqMap.containsKey(v.getSku()));

            // Update / Insert requested variants
            for (ProductVariantDto reqDto : requestedVariants) {
                ProductVariant existing = existingVariants.stream()
                        .filter(v -> v.getSku().equals(reqDto.getSku()))
                        .findFirst().orElse(null);

                if (existing != null) {
                    existing.setSize(reqDto.getSize());
                    existing.setColor(reqDto.getColor());
                    existing.setPriceModifier(reqDto.getPriceModifier());
                    if (existing.getInventory() != null) {
                        existing.getInventory().setStockQuantity(reqDto.getStockQuantity());
                        existing.getInventory().setLowStockThreshold(reqDto.getLowStockThreshold());
                    } else {
                        existing.setInventory(Inventory.builder()
                                .productVariant(existing)
                                .stockQuantity(reqDto.getStockQuantity())
                                .lowStockThreshold(reqDto.getLowStockThreshold())
                                .build());
                    }
                } else {
                    ProductVariant newVariant = ProductVariant.builder()
                            .product(product)
                            .sku(reqDto.getSku())
                            .size(reqDto.getSize())
                            .color(reqDto.getColor())
                            .priceModifier(reqDto.getPriceModifier())
                            .build();

                    Inventory newInventory = Inventory.builder()
                            .productVariant(newVariant)
                            .stockQuantity(reqDto.getStockQuantity())
                            .lowStockThreshold(reqDto.getLowStockThreshold())
                            .build();

                    newVariant.setInventory(newInventory);
                    existingVariants.add(newVariant);
                }
            }
        }

        Product saved = productRepository.save(product);
        log.info("Product updated: {}, awaiting admin approval", saved.getName());
        return mapToProductResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#slug")
    public void deleteProduct(String slug, String vendorEmail) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getStore().getVendor().getUser().getEmail().equals(vendorEmail)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this product");
        }

        productRepository.delete(product);
        log.info("Product deleted: {}", slug);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#result.slug", condition = "#result != null")
    public ProductResponse approveProduct(Long productId, boolean approve) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));

        product.setApproved(approve);
        Product saved = productRepository.save(product);
        log.info("Product moderation outcome: ID={}, approved={}", productId, approve);
        return mapToProductResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));
        return mapToProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsForVendor(String vendorEmail, int page, int size) {
        Store store = storeRepository.findByVendorUserEmail(vendorEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Store not found for this account"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        
        Specification<Product> spec = (root, query, cb) -> cb.equal(root.get("store"), store);
        return productRepository.findAll(spec, pageable).map(this::mapToProductResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, String categorySlug, BigDecimal minPrice, BigDecimal maxPrice,
                                                 String size, String color, int page, int sizeCount, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, sizeCount, sort);

        Specification<Product> spec = (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search view gets only approved & active products
            predicates.add(cb.equal(root.get("isApproved"), true));
            predicates.add(cb.equal(root.get("isActive"), true));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (categorySlug != null && !categorySlug.isBlank()) {
                predicates.add(cb.equal(root.join("category").get("slug"), categorySlug));
            }

            if (minPrice != null) {
                predicates.add(cb.ge(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.le(root.get("price"), maxPrice));
            }

            if ((size != null && !size.isBlank()) || (color != null && !color.isBlank())) {
                Join<Product, ProductVariant> variantsJoin = root.join("variants", JoinType.INNER);
                if (size != null && !size.isBlank()) {
                    predicates.add(cb.equal(cb.lower(variantsJoin.get("size")), size.toLowerCase()));
                }
                if (color != null && !color.isBlank()) {
                    predicates.add(cb.equal(cb.lower(variantsJoin.get("color")), color.toLowerCase()));
                }
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(this::mapToProductResponse);
    }

    private String generateSlug(String input) {
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }

    private ProductResponse mapToProductResponse(Product product) {
        List<ProductImageDto> images = product.getImages().stream()
                .map(img -> ProductImageDto.builder()
                        .url(img.getUrl())
                        .isPrimary(img.isPrimary())
                        .build())
                .collect(Collectors.toList());

        List<ProductVariantDto> variants = product.getVariants().stream()
                .map(v -> ProductVariantDto.builder()
                        .id(v.getId())
                        .sku(v.getSku())
                        .size(v.getSize())
                        .color(v.getColor())
                        .priceModifier(v.getPriceModifier())
                        .stockQuantity(v.getInventory() != null ? v.getInventory().getStockQuantity() : 0)
                        .lowStockThreshold(v.getInventory() != null ? v.getInventory().getLowStockThreshold() : 5)
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .storeId(product.getStore().getId())
                .storeName(product.getStore().getName())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .isApproved(product.isApproved())
                .isActive(product.isActive())
                .images(images)
                .variants(variants)
                .build();
    }
}
