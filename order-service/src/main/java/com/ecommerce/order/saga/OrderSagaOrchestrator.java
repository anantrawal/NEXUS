package com.ecommerce.order.saga;

import com.ecommerce.order.kafka.OrderEvents.*;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.Order.OrderStatus;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

/**
 * OrderSagaOrchestrator - Orchestration-based Saga for distributed order processing.
 *
 * Flow:
 *   [1] PlaceOrder → emit PaymentRequestEvent
 *   [2] PaymentResult (success) → update status → emit InventoryReserveEvent
 *   [2] PaymentResult (failure) → mark PAYMENT_FAILED (no compensation needed yet)
 *   [3] InventoryResult (success) → mark CONFIRMED → emit OrderCompletedEvent
 *   [3] InventoryResult (failure) → emit PaymentRefundEvent (compensating tx) → mark CANCELLED
 *
 * Each step is idempotent: re-processing the same event produces the same outcome.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaOrchestrator {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_PAYMENT_REQUEST  = "order.payment.request";
    public static final String TOPIC_PAYMENT_REFUND   = "order.payment.refund";
    public static final String TOPIC_INVENTORY_RESERVE = "order.inventory.reserve";
    public static final String TOPIC_ORDER_COMPLETED  = "order.completed";

    // ─── STEP 1: Initiate Saga ───────────────────────────────────

    @Transactional
    public void startSaga(Order order, String paymentToken, String paymentMethod) {
        String sagaId = UUID.randomUUID().toString();
        order.setSagaId(sagaId);
        order.setStatus(OrderStatus.PAYMENT_INITIATED);
        order.setPaymentMethod(paymentMethod);
        orderRepository.save(order);

        PaymentRequestEvent event = PaymentRequestEvent.builder()
            .sagaId(sagaId)
            .orderId(order.getId())
            .userId(order.getUserId())
            .userEmail(order.getUserEmail())
            .amount(order.getTotalAmount())
            .paymentMethod(paymentMethod)
            .paymentToken(paymentToken)
            .build();

        kafkaTemplate.send(TOPIC_PAYMENT_REQUEST, order.getId(), event);
        log.info("[SAGA {}] Started — Order: {}, Amount: {}", sagaId, order.getId(), order.getTotalAmount());
    }

    // ─── STEP 2: Handle Payment Result ──────────────────────────

    @Transactional
    public void handlePaymentResult(PaymentResultEvent event) {
        Order order = orderRepository.findById(event.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

        // Idempotency guard
        if (order.getStatus() != OrderStatus.PAYMENT_INITIATED) {
            log.warn("[SAGA {}] Duplicate payment event ignored for order {}", event.getSagaId(), event.getOrderId());
            return;
        }

        if (event.isSuccess()) {
            order.setStatus(OrderStatus.PAYMENT_COMPLETED);
            order.setPaymentId(event.getPaymentId());
            orderRepository.save(order);

            // Proceed to next step: reserve inventory
            InventoryReserveEvent reserveEvent = InventoryReserveEvent.builder()
                .sagaId(event.getSagaId())
                .orderId(order.getId())
                .items(order.getItems().stream()
                    .map(i -> InventoryReserveEvent.InventoryItem.builder()
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .build())
                    .collect(Collectors.toList()))
                .build();

            kafkaTemplate.send(TOPIC_INVENTORY_RESERVE, order.getId(), reserveEvent);
            log.info("[SAGA {}] Payment succeeded — proceeding to inventory reservation", event.getSagaId());

        } else {
            // No compensating tx needed (payment never charged)
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            order.setFailureReason("Payment failed: " + event.getFailureReason());
            orderRepository.save(order);
            log.warn("[SAGA {}] Payment FAILED for order {} — reason: {}", event.getSagaId(), event.getOrderId(), event.getFailureReason());
        }
    }

    // ─── STEP 3: Handle Inventory Result ────────────────────────

    @Transactional
    public void handleInventoryResult(InventoryResultEvent event) {
        Order order = orderRepository.findById(event.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));

        if (order.getStatus() != OrderStatus.PAYMENT_COMPLETED) {
            log.warn("[SAGA {}] Duplicate inventory event ignored for order {}", event.getSagaId(), event.getOrderId());
            return;
        }

        if (event.isSuccess()) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Notify: order fully confirmed
            OrderCompletedEvent completedEvent = OrderCompletedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .userEmail(order.getUserEmail())
                .totalAmount(order.getTotalAmount())
                .itemCount(order.getItems().size())
                .build();

            kafkaTemplate.send(TOPIC_ORDER_COMPLETED, order.getId(), completedEvent);
            log.info("[SAGA {}] ✅ Order {} CONFIRMED — Saga complete", event.getSagaId(), order.getId());

        } else {
            // COMPENSATING TRANSACTION: refund the payment
            order.setStatus(OrderStatus.INVENTORY_FAILED);
            order.setFailureReason("Inventory unavailable: " + event.getFailureReason());
            orderRepository.save(order);

            PaymentRefundEvent refundEvent = PaymentRefundEvent.builder()
                .sagaId(event.getSagaId())
                .orderId(order.getId())
                .paymentId(order.getPaymentId())
                .amount(order.getTotalAmount())
                .reason("Inventory reservation failed — automatic refund")
                .build();

            kafkaTemplate.send(TOPIC_PAYMENT_REFUND, order.getId(), refundEvent);
            log.warn("[SAGA {}] ⚠️  Inventory FAILED for order {} — compensation (refund) triggered", event.getSagaId(), event.getOrderId());
        }
    }
}
