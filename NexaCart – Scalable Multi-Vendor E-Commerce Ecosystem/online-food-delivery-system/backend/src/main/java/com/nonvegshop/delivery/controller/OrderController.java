package com.nonvegshop.delivery.controller;

import com.nonvegshop.delivery.dto.DeliveryChargeRequest;
import com.nonvegshop.delivery.dto.DeliveryChargeResponse;
import com.nonvegshop.delivery.dto.OrderRequest;
import com.nonvegshop.delivery.entity.Order;
import com.nonvegshop.delivery.service.DeliveryService;
import com.nonvegshop.delivery.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.nonvegshop.delivery.entity.User;
import com.nonvegshop.delivery.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.nonvegshop.delivery.service.RealtimeOrderService;

import java.util.List;
import java.util.Map;

@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RealtimeOrderService realtimeOrderService;

    // Public endpoints
    @PostMapping("/orders/place")
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(request));
    }

    @GetMapping("/orders/track/{orderNumber}")
    public ResponseEntity<Order> trackOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @GetMapping(value = "/orders/track/{orderNumber}/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCustomerOrder(@PathVariable String orderNumber) {
        return realtimeOrderService.subscribeCustomer(orderNumber);
    }

    @PostMapping("/orders/calculate-delivery")
    public ResponseEntity<DeliveryChargeResponse> calculateDeliveryFee(
            @Valid @RequestBody DeliveryChargeRequest request) {
        return ResponseEntity.ok(deliveryService.calculateDelivery(
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude()
        ));
    }

    // Authenticated customer endpoint: Get their history
    @GetMapping("/orders/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(orderService.getOrdersByPhone(userDetails.getUsername()));
    }

    // Admin endpoints
    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAllOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByPhone(userDetails.getUsername()).orElseThrow();
        if ("MERCHANT".equals(user.getRole())) {
            return ResponseEntity.ok(orderService.getOrdersByRestaurant(user.getRestaurant().getId()));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping(value = "/admin/orders/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMerchantOrders(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Access denied");
        }
        User user = userRepository.findByPhone(userDetails.getUsername()).orElseThrow();
        Long restaurantId = user.getRestaurant() != null ? user.getRestaurant().getId() : null;
        return realtimeOrderService.subscribeMerchant(restaurantId);
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/admin/orders/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByPhone(userDetails.getUsername()).orElseThrow();
        if ("MERCHANT".equals(user.getRole())) {
            return ResponseEntity.ok(orderService.getDashboardStats(user.getRestaurant().getId()));
        }
        return ResponseEntity.ok(orderService.getDashboardStats(null));
    }
}
