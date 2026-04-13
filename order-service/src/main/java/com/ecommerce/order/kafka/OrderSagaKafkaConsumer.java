package com.ecommerce.order.kafka;

import com.ecommerce.order.kafka.OrderEvents.*;
import com.ecommerce.order.saga.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaKafkaConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;

    @KafkaListener(
        topics = "payment.result",
        groupId = "order-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onPaymentResult(
            @Payload PaymentResultEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("[KAFKA] Received PaymentResultEvent for order={} success={} offset={}",
            event.getOrderId(), event.isSuccess(), offset);
        try {
            sagaOrchestrator.handlePaymentResult(event);
        } catch (Exception e) {
            log.error("[KAFKA] Failed to process PaymentResultEvent for order {}: {}",
                event.getOrderId(), e.getMessage(), e);
            // In production: send to Dead Letter Topic (DLT)
        }
    }

    @KafkaListener(
        topics = "inventory.result",
        groupId = "order-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onInventoryResult(
            @Payload InventoryResultEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("[KAFKA] Received InventoryResultEvent for order={} success={} offset={}",
            event.getOrderId(), event.isSuccess(), offset);
        try {
            sagaOrchestrator.handleInventoryResult(event);
        } catch (Exception e) {
            log.error("[KAFKA] Failed to process InventoryResultEvent for order {}: {}",
                event.getOrderId(), e.getMessage(), e);
        }
    }
}
