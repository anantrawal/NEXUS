package com.ecommerce.order.kafka;

import com.ecommerce.order.saga.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaEventConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;

    @KafkaListener(topics = "payment.result", groupId = "order-service",
                   containerFactory = "kafkaListenerContainerFactory")
    public void handlePaymentResult(OrderEvents.PaymentResultEvent event) {
        log.info("[KAFKA] Received payment result for order: {}, success: {}",
            event.getOrderId(), event.isSuccess());
        sagaOrchestrator.handlePaymentResult(event);
    }

    @KafkaListener(topics = "inventory.result", groupId = "order-service",
                   containerFactory = "kafkaListenerContainerFactory")
    public void handleInventoryResult(OrderEvents.InventoryResultEvent event) {
        log.info("[KAFKA] Received inventory result for order: {}, success: {}",
            event.getOrderId(), event.isSuccess());
        sagaOrchestrator.handleInventoryResult(event);
    }
}
