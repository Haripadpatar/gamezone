package com.nexacart.backend.modules.order.dto;

import com.nexacart.backend.modules.user.dto.AddressDto;
import lombok.Data;

@Data
public class CheckoutRequest {
    
    private Long shippingAddressId;
    
    private AddressDto newShippingAddress;
    
    private String couponCode;
}
