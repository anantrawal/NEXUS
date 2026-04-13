package com.ecommerce.cart.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class Cart implements Serializable {

    private String userId;
    private List<CartItem> items = new ArrayList<>();

    public BigDecimal getTotalPrice() {
        if (items == null) return BigDecimal.ZERO;
        return items.stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int getTotalItems() {
        if (items == null) return 0;
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }

    public void addItem(CartItem newItem) {
        if (items == null) items = new ArrayList<>();
        items.stream()
            .filter(i -> i.getProductId().equals(newItem.getProductId()))
            .findFirst()
            .ifPresentOrElse(
                existing -> existing.setQuantity(existing.getQuantity() + newItem.getQuantity()),
                () -> items.add(newItem)
            );
    }

    public void removeItem(String productId) {
        if (items == null) return;
        items.removeIf(i -> i.getProductId().equals(productId));
    }

    public void updateQuantity(String productId, int quantity) {
        if (items == null) return;
        if (quantity <= 0) {
            removeItem(productId);
        } else {
            items.stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CartItem implements Serializable {
        private String productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private int quantity;
        private String category;
    }
}
