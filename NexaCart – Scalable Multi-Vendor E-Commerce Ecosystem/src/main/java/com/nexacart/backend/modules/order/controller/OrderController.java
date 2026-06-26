package com.nexacart.backend.modules.order.controller;

import com.nexacart.backend.global.response.ApiResponse;
import com.nexacart.backend.modules.order.dto.CheckoutRequest;
import com.nexacart.backend.modules.order.dto.OrderResponse;
import com.nexacart.backend.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.createOrder(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Order placed successfully. Awaiting payment."));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<OrderResponse> response = orderService.getMyOrders(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Order history retrieved successfully"));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetails(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.getOrderByNumber(orderNumber, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Order details retrieved successfully"));
    }

    @PostMapping("/{orderNumber}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        orderService.cancelOrder(orderNumber, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully"));
    }

    @PutMapping("/items/{orderItemId}/fulfillment")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<ApiResponse<Void>> updateOrderItemFulfillment(
            @PathVariable Long orderItemId,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        orderService.updateOrderItemFulfillment(orderItemId, status, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order item fulfillment updated successfully"));
    }
}
