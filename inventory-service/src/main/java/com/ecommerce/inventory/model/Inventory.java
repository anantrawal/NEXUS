package com.ecommerce.inventory.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "inventory")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id
    private String id;

    @Indexed(unique = true)
    private String productId;

    private String productName;

    private int availableQuantity;

    private int reservedQuantity;

    private int reorderThreshold = 10;

    @LastModifiedDate
    private LocalDateTime lastUpdated;

    public int getTotalQuantity() {
        return availableQuantity + reservedQuantity;
    }

    public boolean hasStock(int requested) {
        return availableQuantity >= requested;
    }

    public void reserve(int quantity) {
        if (!hasStock(quantity)) {
            throw new IllegalStateException("Insufficient stock for product: " + productId);
        }
        availableQuantity -= quantity;
        reservedQuantity += quantity;
    }

    public void release(int quantity) {
        reservedQuantity = Math.max(0, reservedQuantity - quantity);
        availableQuantity += quantity;
    }

    public void deduct(int quantity) {
        reservedQuantity = Math.max(0, reservedQuantity - quantity);
    }
}
