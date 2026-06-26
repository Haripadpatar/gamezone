package com.nonvegshop.delivery.service;

import com.nonvegshop.delivery.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class RealtimeOrderService {
    private static final Logger logger = LoggerFactory.getLogger(RealtimeOrderService.class);

    // Emitters for merchant dashboard, keyed by restaurantId (0L means global admin)
    private final Map<Long, List<SseEmitter>> merchantEmitters = new ConcurrentHashMap<>();

    // Emitters for customer order tracking, keyed by orderNumber
    private final Map<String, List<SseEmitter>> customerEmitters = new ConcurrentHashMap<>();

    private static final long SSE_TIMEOUT = 120 * 60 * 1000L; // 2 hours

    public SseEmitter subscribeMerchant(Long restaurantId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        Long key = restaurantId == null ? 0L : restaurantId;

        merchantEmitters.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeMerchantEmitter(key, emitter));
        emitter.onTimeout(() -> removeMerchantEmitter(key, emitter));
        emitter.onError(e -> removeMerchantEmitter(key, emitter));

        // Send initial connect message
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Connected to Merchant Realtime Orders Stream"));
        } catch (IOException e) {
            removeMerchantEmitter(key, emitter);
        }

        return emitter;
    }

    public SseEmitter subscribeCustomer(String orderNumber) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        customerEmitters.computeIfAbsent(orderNumber, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeCustomerEmitter(orderNumber, emitter));
        emitter.onTimeout(() -> removeCustomerEmitter(orderNumber, emitter));
        emitter.onError(e -> removeCustomerEmitter(orderNumber, emitter));

        // Send initial connect message
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Connected to Customer Tracking Stream"));
        } catch (IOException e) {
            removeCustomerEmitter(orderNumber, emitter);
        }

        return emitter;
    }

    private void removeMerchantEmitter(Long key, SseEmitter emitter) {
        List<SseEmitter> list = merchantEmitters.get(key);
        if (list != null) {
            list.remove(emitter);
        }
    }

    private void removeCustomerEmitter(String orderNumber, SseEmitter emitter) {
        List<SseEmitter> list = customerEmitters.get(orderNumber);
        if (list != null) {
            list.remove(emitter);
        }
    }

    public void publishNewOrder(Order order) {
        if (order == null) return;
        Long restaurantId = order.getRestaurant() != null ? order.getRestaurant().getId() : null;
        
        // Notify scoped restaurant merchants
        if (restaurantId != null) {
            sendToMerchantEmitters(restaurantId, "NEW_ORDER", order);
        }
        
        // Notify global admin merchants
        sendToMerchantEmitters(0L, "NEW_ORDER", order);
    }

    public void publishOrderStatusUpdate(Order order) {
        if (order == null) return;
        Long restaurantId = order.getRestaurant() != null ? order.getRestaurant().getId() : null;

        // Notify scoped restaurant merchants
        if (restaurantId != null) {
            sendToMerchantEmitters(restaurantId, "ORDER_UPDATED", order);
        }

        // Notify global admin merchants
        sendToMerchantEmitters(0L, "ORDER_UPDATED", order);

        // Notify tracking customer
        sendToCustomerEmitters(order.getOrderNumber(), "ORDER_UPDATED", order);
    }

    private void sendToMerchantEmitters(Long key, String eventName, Object data) {
        List<SseEmitter> emitters = merchantEmitters.get(key);
        if (emitters == null || emitters.isEmpty()) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        for (SseEmitter dead : deadEmitters) {
            removeMerchantEmitter(key, dead);
        }
    }

    private void sendToCustomerEmitters(String orderNumber, String eventName, Object data) {
        List<SseEmitter> emitters = customerEmitters.get(orderNumber);
        if (emitters == null || emitters.isEmpty()) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        for (SseEmitter dead : deadEmitters) {
            removeCustomerEmitter(orderNumber, dead);
        }
    }

    // Keep-alive heartbeat task every 25 seconds
    @Scheduled(fixedDelay = 25000)
    public void sendHeartbeats() {
        // Send heartbeat to merchant emitters
        for (Map.Entry<Long, List<SseEmitter>> entry : merchantEmitters.entrySet()) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().name("HEARTBEAT").data("ping"));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            for (SseEmitter dead : deadEmitters) {
                removeMerchantEmitter(entry.getKey(), dead);
            }
        }

        // Send heartbeat to customer emitters
        for (Map.Entry<String, List<SseEmitter>> entry : customerEmitters.entrySet()) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().name("HEARTBEAT").data("ping"));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            for (SseEmitter dead : deadEmitters) {
                removeCustomerEmitter(entry.getKey(), dead);
            }
        }
    }
}
