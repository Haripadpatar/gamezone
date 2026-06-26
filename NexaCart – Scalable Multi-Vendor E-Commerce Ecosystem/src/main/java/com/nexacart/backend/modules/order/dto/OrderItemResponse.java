package com.nexacart.backend.modules.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productVariantId;
    private String sku;
    private String productName;
    private int quantity;
    private BigDecimal price;
    private String fulfillmentStatus;
}
