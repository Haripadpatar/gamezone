package com.nonvegshop.delivery.service;

import com.nonvegshop.delivery.dto.DeliveryChargeResponse;
import com.nonvegshop.delivery.dto.OrderItemRequest;
import com.nonvegshop.delivery.dto.OrderRequest;
import com.nonvegshop.delivery.entity.Order;
import com.nonvegshop.delivery.entity.OrderItem;
import com.nonvegshop.delivery.entity.Product;
import com.nonvegshop.delivery.exception.BadRequestException;
import com.nonvegshop.delivery.exception.ResourceNotFoundException;
import com.nonvegshop.delivery.repository.OrderRepository;
import com.nonvegshop.delivery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RealtimeOrderService realtimeOrderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DeliveryService deliveryService;

    @Transactional
    public Order placeOrder(OrderRequest request) {
        // 1. Calculate Delivery Charge and Verify Deliverability
        DeliveryChargeResponse deliveryDetails = deliveryService.calculateDelivery(
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude()
        );
        if (!deliveryDetails.isDeliverable()) {
            throw new BadRequestException("Address is not deliverable. Distance: " + deliveryDetails.getDistanceKm() + " km");
        }

        Order order = new Order();
        order.setOrderNumber("ORD-" + System.currentTimeMillis() % 100000000L);
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNotes(request.getNotes());
        order.setDistanceKm(deliveryDetails.getDistanceKm());
        order.setDeliveryCharge(deliveryDetails.getDeliveryCharge());
        order.setStatus("PLACED");
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "PENDING");
        order.setLatitude(request.getLatitude());
        order.setLongitude(request.getLongitude());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // 2. Validate Items & Stock, Calculate Subtotal
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() 
                        + ". Available: " + product.getStock() + " kg/unit, Requested: " + itemReq.getQuantity());
            }

            if (order.getRestaurant() == null && product.getRestaurant() != null) {
                order.setRestaurant(product.getRestaurant());
            }

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            orderItems.add(orderItem);
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(order.getDeliveryCharge()));
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        realtimeOrderService.publishNewOrder(savedOrder);
        return savedOrder;
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByPhone(String phone) {
        return orderRepository.findByPhoneOrderByCreatedAtDesc(phone);
    }

    public List<Order> getOrdersByRestaurant(Long restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        String oldStatus = order.getStatus();
        String newStatus = status.toUpperCase();

        // Validate Status transition
        List<String> validStatuses = Arrays.asList("PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(newStatus)) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        // Restock items if order gets cancelled
        if ("CANCELLED".equals(newStatus) && !"CANCELLED".equals(oldStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setStock(product.getStock() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }
        // Deduct items if order gets un-cancelled (rare, but good practice)
        else if (!"CANCELLED".equals(newStatus) && "CANCELLED".equals(oldStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    if (product.getStock() < item.getQuantity()) {
                        throw new BadRequestException("Cannot restore order. Insufficient stock for product: " + product.getName());
                    }
                    product.setStock(product.getStock() - item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        realtimeOrderService.publishOrderStatusUpdate(updatedOrder);
        return updatedOrder;
    }

    public Map<String, Object> getDashboardStats(Long restaurantId) {
        List<Order> orders = restaurantId != null 
                ? orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                : orderRepository.findAll();
        
        long totalOrders = orders.size();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long pendingOrders = 0;
        long deliveredOrders = 0;
        
        long todayOrders = 0;
        BigDecimal revenueToday = BigDecimal.ZERO;
        BigDecimal revenueThisMonth = BigDecimal.ZERO;

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        java.time.LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();

        for (Order order : orders) {
            String status = order.getStatus();
            java.time.LocalDateTime orderDate = order.getCreatedAt();
            if (orderDate == null) {
                orderDate = now;
            }

            boolean isToday = orderDate.isAfter(startOfDay);
            boolean isThisMonth = orderDate.isAfter(startOfMonth);

            if ("DELIVERED".equals(status)) {
                totalRevenue = totalRevenue.add(order.getTotalAmount());
                deliveredOrders++;

                if (isToday) {
                    revenueToday = revenueToday.add(order.getTotalAmount());
                }
                if (isThisMonth) {
                    revenueThisMonth = revenueThisMonth.add(order.getTotalAmount());
                }
            } else if (!"CANCELLED".equals(status)) {
                pendingOrders++;
            }

            if (isToday) {
                todayOrders++;
            }
        }

        // Top Selling Products Calculation
        Map<Product, Double> productQuantities = new HashMap<>();
        for (Order order : orders) {
            if (!"CANCELLED".equals(order.getStatus())) {
                for (OrderItem item : order.getItems()) {
                    Product p = item.getProduct();
                    if (p != null) {
                        productQuantities.put(p, productQuantities.getOrDefault(p, 0.0) + item.getQuantity());
                    }
                }
            }
        }

        List<Map<String, Object>> topProducts = productQuantities.entrySet().stream()
                .sorted(Map.Entry.<Product, Double>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> prodMap = new HashMap<>();
                    prodMap.put("id", entry.getKey().getId());
                    prodMap.put("name", entry.getKey().getName());
                    prodMap.put("quantity", entry.getValue());
                    prodMap.put("price", entry.getKey().getPrice());
                    return prodMap;
                })
                .toList();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("revenue", totalRevenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("deliveredOrders", deliveredOrders);
        stats.put("todayOrders", todayOrders);
        stats.put("revenueToday", revenueToday);
        stats.put("revenueThisMonth", revenueThisMonth);
        stats.put("topProducts", topProducts);
        return stats;
    }
}
