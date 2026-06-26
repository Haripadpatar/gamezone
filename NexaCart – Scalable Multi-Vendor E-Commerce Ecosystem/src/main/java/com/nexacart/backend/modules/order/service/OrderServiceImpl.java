package com.nexacart.backend.modules.order.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.cart.model.Cart;
import com.nexacart.backend.modules.cart.model.CartItem;
import com.nexacart.backend.modules.cart.repository.CartRepository;
import com.nexacart.backend.modules.order.dto.CheckoutRequest;
import com.nexacart.backend.modules.order.dto.OrderItemResponse;
import com.nexacart.backend.modules.order.dto.OrderResponse;
import com.nexacart.backend.modules.order.model.Order;
import com.nexacart.backend.modules.order.model.OrderItem;
import com.nexacart.backend.modules.order.repository.OrderItemRepository;
import com.nexacart.backend.modules.order.repository.OrderRepository;
import com.nexacart.backend.modules.payment.model.Payment;
import com.nexacart.backend.modules.payment.repository.PaymentRepository;
import com.nexacart.backend.modules.product.model.Inventory;
import com.nexacart.backend.modules.product.model.ProductVariant;
import com.nexacart.backend.modules.product.repository.ProductVariantRepository;
import com.nexacart.backend.modules.user.dto.AddressDto;
import com.nexacart.backend.modules.user.model.Address;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.repository.AddressRepository;
import com.nexacart.backend.modules.user.repository.UserRepository;
import com.nexacart.backend.modules.vendor.model.Coupon;
import com.nexacart.backend.modules.vendor.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(CheckoutRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Cart not found"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Cannot checkout an empty cart");
        }

        // 1. Resolve Shipping Address
        Address address;
        if (request.getShippingAddressId() != null) {
            address = addressRepository.findById(request.getShippingAddressId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Shipping address not found"));
            if (!address.getUser().getId().equals(user.getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "Address does not belong to you");
            }
        } else if (request.getNewShippingAddress() != null) {
            AddressDto dto = request.getNewShippingAddress();
            address = Address.builder()
                    .user(user)
                    .street(dto.getStreet())
                    .city(dto.getCity())
                    .state(dto.getState())
                    .zipCode(dto.getZipCode())
                    .country(dto.getCountry())
                    .build();
            address = addressRepository.save(address);
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Shipping address is required");
        }

        // 2. Compute Pricing & Commission
        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;

        for (CartItem item : cart.getCartItems()) {
            ProductVariant variant = item.getProductVariant();
            BigDecimal price = variant.getProduct().getPrice().add(variant.getPriceModifier());
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            totalPrice = totalPrice.add(subtotal);

            // Compute platform commission per store items
            BigDecimal storeCommissionRate = variant.getProduct().getStore().getCommissionRate();
            BigDecimal commission = subtotal.multiply(storeCommissionRate).divide(new BigDecimal("100"));
            totalCommission = totalCommission.add(commission);
        }

        // 3. Apply Coupon if applicable
        Coupon coupon = null;
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCode(request.getCouponCode())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Coupon not found"));
            if (!coupon.isActive() || coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Coupon has expired or is inactive");
            }
            if (totalPrice.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Minimum order amount not met for this coupon");
            }
            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = totalPrice.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"));
            } else {
                discount = coupon.getDiscountValue();
            }
        }

        BigDecimal finalPrice = totalPrice.subtract(discount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        // 4. Create Order & Items
        String orderNumber = "NC-" + System.currentTimeMillis();
        Order order = Order.builder()
                .user(user)
                .shippingAddress(address)
                .totalAmount(finalPrice)
                .platformCommission(totalCommission)
                .status("PENDING")
                .orderNumber(orderNumber)
                .coupon(coupon)
                .build();

        for (CartItem item : cart.getCartItems()) {
            ProductVariant variant = item.getProductVariant();
            BigDecimal price = variant.getProduct().getPrice().add(variant.getPriceModifier());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .store(variant.getProduct().getStore())
                    .quantity(item.getQuantity())
                    .price(price)
                    .fulfillmentStatus("PENDING")
                    .build();
            order.getOrderItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // 5. Create Payment record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .amount(finalPrice)
                .provider("RAZORPAY")
                .status("PENDING")
                .build();
        paymentRepository.save(payment);

        // 6. Clear user cart
        cart.getCartItems().clear();
        cartRepository.save(cart);

        log.info("Order created: {} with total: {}", orderNumber, finalPrice);
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String email) {
        return orderRepository.findByUserEmail(email).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber, String email) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getEmail().equals(email)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this order");
        }
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public void cancelOrder(String orderNumber, String email) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getEmail().equals(email)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not own this order");
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus()) && !"PAID".equalsIgnoreCase(order.getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only pending or paid orders can be cancelled");
        }

        // Check if any items are already shipped
        for (OrderItem item : order.getOrderItems()) {
            if ("SHIPPED".equalsIgnoreCase(item.getFulfillmentStatus()) || "DELIVERED".equalsIgnoreCase(item.getFulfillmentStatus())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Cannot cancel order because some items have already been shipped or delivered");
            }
        }

        // Restore Inventory stock if order was paid
        if ("PAID".equalsIgnoreCase(order.getStatus())) {
            for (OrderItem item : order.getOrderItems()) {
                ProductVariant variant = item.getProductVariant();
                if (variant.getInventory() != null) {
                    Inventory inventory = variant.getInventory();
                    inventory.setStockQuantity(inventory.getStockQuantity() + item.getQuantity());
                    productVariantRepository.save(variant);
                }
            }
        }

        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment != null && "SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);
        }

        orderRepository.save(order);
        log.info("Order cancelled successfully: {}", orderNumber);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"vendor_analytics", "admin_analytics"}, allEntries = true)
    public void updateOrderItemFulfillment(Long orderItemId, String status, String vendorEmail) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order item not found"));

        if (!item.getStore().getVendor().getUser().getEmail().equals(vendorEmail)) {
            throw new AppException(HttpStatus.FORBIDDEN, "This item does not belong to your store");
        }

        if ("CANCELLED".equalsIgnoreCase(item.getOrder().getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Cannot fulfill a cancelled order");
        }

        item.setFulfillmentStatus(status.toUpperCase());
        orderItemRepository.save(item);

        // Check if all items in the order are fulfilled/shipped/delivered to update the parent order status
        Order order = item.getOrder();
        boolean allShipped = true;
        boolean allDelivered = true;

        for (OrderItem oi : order.getOrderItems()) {
            if (!"SHIPPED".equalsIgnoreCase(oi.getFulfillmentStatus()) && !"DELIVERED".equalsIgnoreCase(oi.getFulfillmentStatus())) {
                allShipped = false;
            }
            if (!"DELIVERED".equalsIgnoreCase(oi.getFulfillmentStatus())) {
                allDelivered = false;
            }
        }

        if (allDelivered) {
            order.setStatus("DELIVERED");
        } else if (allShipped) {
            order.setStatus("SHIPPED");
        }
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Order item fulfillment updated: ItemId={}, Status={}", orderItemId, status);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        Address addr = order.getShippingAddress();
        AddressDto addressDto = AddressDto.builder()
                .id(addr.getId())
                .street(addr.getStreet())
                .city(addr.getCity())
                .state(addr.getState())
                .zipCode(addr.getZipCode())
                .country(addr.getCountry())
                .build();

        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productVariantId(item.getProductVariant().getId())
                        .sku(item.getProductVariant().getSku())
                        .productName(item.getProductVariant().getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .fulfillmentStatus(item.getFulfillmentStatus())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(addressDto)
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
