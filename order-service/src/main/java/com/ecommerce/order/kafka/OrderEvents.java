package com.ecommerce.order.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Kafka event contracts for the Order Saga.
 * Published by Order Service (orchestrator) and consumed by downstream services.
 */
public class OrderEvents {

    // ─── Outbound: Order → Payment ───────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentRequestEvent {
        private String sagaId;
        private String orderId;
        private String userId;
        private String userEmail;
        private BigDecimal amount;
        private String paymentMethod;
        // In production: encrypted payment token from frontend (Stripe PaymentMethod ID)
        private String paymentToken;
    }

    // ─── Inbound: Payment → Order ────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentResultEvent {
        private String sagaId;
        private String orderId;
        private boolean success;
        private String paymentId;
        private String failureReason;
    }

    // ─── Outbound: Order → Inventory ─────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InventoryReserveEvent {
        private String sagaId;
        private String orderId;
        private List<InventoryItem> items;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class InventoryItem {
            private String productId;
            private int quantity;
        }
    }

    // ─── Inbound: Inventory → Order ──────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InventoryResultEvent {
        private String sagaId;
        private String orderId;
        private boolean success;
        private String failureReason;
    }

    // ─── Compensating: Order → Payment (refund) ──────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentRefundEvent {
        private String sagaId;
        private String orderId;
        private String paymentId;
        private BigDecimal amount;
        private String reason;
    }

    // ─── Outbound: Order completed (for notifications) ───────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderCompletedEvent {
        private String orderId;
        private String userId;
        private String userEmail;
        private BigDecimal totalAmount;
        private int itemCount;
    }
}
