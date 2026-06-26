package com.nexacart.backend.modules.payment.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.order.model.Order;
import com.nexacart.backend.modules.order.model.OrderItem;
import com.nexacart.backend.modules.order.repository.OrderRepository;
import com.nexacart.backend.modules.payment.dto.PaymentVerificationRequest;
import com.nexacart.backend.modules.payment.model.Payment;
import com.nexacart.backend.modules.payment.repository.PaymentRepository;
import com.nexacart.backend.modules.product.model.Inventory;
import com.nexacart.backend.modules.product.model.ProductVariant;
import com.nexacart.backend.modules.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    @CacheEvict(value = {"vendor_analytics", "admin_analytics"}, allEntries = true)
    public void verifyPayment(PaymentVerificationRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Order payment has already been verified or cancelled");
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Payment record not found"));

        // Deduct inventory quantities upon successful payment
        for (OrderItem item : order.getOrderItems()) {
            ProductVariant variant = item.getProductVariant();
            if (variant.getInventory() != null) {
                Inventory inventory = variant.getInventory();
                if (inventory.getStockQuantity() < item.getQuantity()) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Insufficient stock for variant: " + variant.getSku());
                }
                inventory.setStockQuantity(inventory.getStockQuantity() - item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        // Verify Razorpay Payment (In production, verify Razorpay signature here. Mock success for test/local setup)
        payment.setStatus("SUCCESS");
        payment.setTransactionId(request.getTransactionId());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setStatus("PAID");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Payment verified successfully for Order: {}, PaymentId: {}", order.getOrderNumber(), request.getTransactionId());
    }
}
