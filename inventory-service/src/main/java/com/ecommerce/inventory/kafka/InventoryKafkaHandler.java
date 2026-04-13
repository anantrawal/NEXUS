package com.ecommerce.inventory.kafka;

import com.ecommerce.inventory.model.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryKafkaHandler {

    private final InventoryRepository inventoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(
        topics = "order.inventory.reserve",
        groupId = "inventory-service-group"
    )
    @Transactional
    public void handleReserveRequest(Map<String, Object> payload) {
        String sagaId  = (String) payload.get("sagaId");
        String orderId = (String) payload.get("orderId");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

        log.info("[INVENTORY] Reserving stock for order={} items={}", orderId, items.size());

        try {
            // Check all items have sufficient stock before reserving any (atomic check)
            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                int quantity = ((Number) item.get("quantity")).intValue();

                Inventory inventory = inventoryRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Product not in inventory: " + productId));

                if (!inventory.hasStock(quantity)) {
                    throw new RuntimeException("Insufficient stock for product: " + productId
                        + " (requested: " + quantity + ", available: " + inventory.getAvailableQuantity() + ")");
                }
            }

            // All checks passed — reserve stock
            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                int quantity = ((Number) item.get("quantity")).intValue();

                Inventory inventory = inventoryRepository.findByProductId(productId).get();
                inventory.reserve(quantity);
                inventoryRepository.save(inventory);
                log.debug("[INVENTORY] Reserved {} units of product {}", quantity, productId);
            }

            InventoryResultEvent result = InventoryResultEvent.builder()
                .sagaId(sagaId).orderId(orderId)
                .success(true).build();
            kafkaTemplate.send("inventory.result", orderId, result);
            log.info("[INVENTORY] ✅ Reservation succeeded for order={}", orderId);

        } catch (Exception e) {
            log.error("[INVENTORY] ❌ Reservation failed for order={}: {}", orderId, e.getMessage());
            InventoryResultEvent result = InventoryResultEvent.builder()
                .sagaId(sagaId).orderId(orderId)
                .success(false).failureReason(e.getMessage()).build();
            kafkaTemplate.send("inventory.result", orderId, result);
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InventoryResultEvent {
        private String sagaId;
        private String orderId;
        private boolean success;
        private String failureReason;
    }
}
