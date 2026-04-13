package com.ecommerce.payment.kafka;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentKafkaHandler {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${stripe.secret-key:sk_test_dummy}")
    private String stripeSecretKey;

    // ─── Inbound: process payment request ───────────────────────

    @KafkaListener(
        topics = "order.payment.request",
        groupId = "payment-service-group"
    )
    @CircuitBreaker(name = "stripe-gateway", fallbackMethod = "paymentFallback")
    @Retry(name = "stripe-gateway")
    public void handlePaymentRequest(Map<String, Object> payload) {
        String sagaId  = (String) payload.get("sagaId");
        String orderId = (String) payload.get("orderId");
        String userEmail = (String) payload.get("userEmail");
        double amountRaw = ((Number) payload.get("amount")).doubleValue();
        BigDecimal amount = BigDecimal.valueOf(amountRaw);
        String token   = (String) payload.getOrDefault("paymentToken", "tok_visa");

        log.info("[PAYMENT] Processing payment for order={} amount={}", orderId, amount);

        try {
            // ── Stripe integration point ──────────────────────────
            // In production, replace stub with:
            //   Stripe.apiKey = stripeSecretKey;
            //   PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            //       .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
            //       .setCurrency("usd")
            //       .setPaymentMethod(token)
            //       .setConfirm(true)
            //       .build();
            //   PaymentIntent intent = PaymentIntent.create(params);
            //   String paymentId = intent.getId();
            // ─────────────────────────────────────────────────────

            // Stub: simulate payment with test token
            boolean success = !"tok_chargeDeclined".equals(token);
            String paymentId = success ? "pi_" + UUID.randomUUID().toString().replace("-", "") : null;

            PaymentResultEvent result = PaymentResultEvent.builder()
                .sagaId(sagaId)
                .orderId(orderId)
                .success(success)
                .paymentId(paymentId)
                .failureReason(success ? null : "Card declined")
                .build();

            kafkaTemplate.send("payment.result", orderId, result);
            log.info("[PAYMENT] Result sent for order={} success={}", orderId, success);

        } catch (Exception e) {
            log.error("[PAYMENT] Exception processing order={}: {}", orderId, e.getMessage());
            PaymentResultEvent failResult = PaymentResultEvent.builder()
                .sagaId(sagaId).orderId(orderId)
                .success(false).failureReason("Payment gateway error: " + e.getMessage())
                .build();
            kafkaTemplate.send("payment.result", orderId, failResult);
        }
    }

    // ─── Inbound: process refund ─────────────────────────────────

    @KafkaListener(
        topics = "order.payment.refund",
        groupId = "payment-service-group"
    )
    public void handleRefund(Map<String, Object> payload) {
        String sagaId   = (String) payload.get("sagaId");
        String orderId  = (String) payload.get("orderId");
        String paymentId = (String) payload.get("paymentId");
        String reason   = (String) payload.get("reason");

        log.info("[PAYMENT] Processing refund for order={} paymentId={} reason={}", orderId, paymentId, reason);

        // In production:
        //   Refund.create(RefundCreateParams.builder().setPaymentIntent(paymentId).build());

        log.info("[PAYMENT] Refund completed for order={}", orderId);
    }

    public void paymentFallback(Map<String, Object> payload, Exception ex) {
        String orderId = (String) payload.get("orderId");
        String sagaId  = (String) payload.get("sagaId");
        log.error("[PAYMENT] Circuit breaker open — fallback for order={}: {}", orderId, ex.getMessage());

        PaymentResultEvent failResult = PaymentResultEvent.builder()
            .sagaId(sagaId).orderId(orderId)
            .success(false).failureReason("Payment service temporarily unavailable")
            .build();
        kafkaTemplate.send("payment.result", orderId, failResult);
    }

    // ─── Event DTO ───────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentResultEvent {
        private String sagaId;
        private String orderId;
        private boolean success;
        private String paymentId;
        private String failureReason;
    }
}
