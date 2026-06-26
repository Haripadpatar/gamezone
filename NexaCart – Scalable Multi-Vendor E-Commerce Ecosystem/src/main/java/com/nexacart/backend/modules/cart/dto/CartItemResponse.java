package com.nexacart.backend.modules.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productVariantId;
    private String sku;
    private String productName;
    private String productSlug;
    private String size;
    private String color;
    private BigDecimal price;
    private int quantity;
    private BigDecimal subTotal;
}
