package com.nexacart.backend.modules.order.dto;

import com.nexacart.backend.modules.user.dto.AddressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String status;
    private AddressDto shippingAddress;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
