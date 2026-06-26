package com.nexacart.backend.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDto {
    
    private Long id;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String size;
    private String color;

    @Builder.Default
    private BigDecimal priceModifier = BigDecimal.ZERO;

    @PositiveOrZero(message = "Stock quantity must be zero or positive")
    private int stockQuantity;

    @PositiveOrZero(message = "Low stock threshold must be zero or positive")
    @Builder.Default
    private int lowStockThreshold = 5;
}
