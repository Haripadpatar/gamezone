package com.nexacart.backend.modules.order.service;

import com.nexacart.backend.modules.order.dto.CheckoutRequest;
import com.nexacart.backend.modules.order.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    
    OrderResponse createOrder(CheckoutRequest request, String email);
    
    List<OrderResponse> getMyOrders(String email);
    
    OrderResponse getOrderByNumber(String orderNumber, String email);
    
    void cancelOrder(String orderNumber, String email);
    
    void updateOrderItemFulfillment(Long orderItemId, String status, String vendorEmail);
}
