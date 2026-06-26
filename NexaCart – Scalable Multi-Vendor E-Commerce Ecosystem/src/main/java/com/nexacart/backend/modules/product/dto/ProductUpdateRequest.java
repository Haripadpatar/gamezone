package com.nexacart.backend.modules.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductUpdateRequest {

    @NotBlank(message = "Category slug is required")
    private String categorySlug;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be greater than zero")
    private BigDecimal price;

    private boolean isActive;

    @Valid
    private List<ProductImageDto> images;

    @Valid
    private List<ProductVariantDto> variants;
}
