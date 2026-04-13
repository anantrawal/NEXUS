package com.ecommerce.order.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal shippingCost = BigDecimal.valueOf(5.99);

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    private String paymentId;
    private String paymentMethod;

    @Embedded
    private ShippingAddress shippingAddress;

    private String failureReason;

    // Saga correlation ID for distributed transaction tracking
    private String sagaId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING,
        PAYMENT_INITIATED,
        PAYMENT_COMPLETED,
        INVENTORY_RESERVED,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        // Failure / compensation states
        PAYMENT_FAILED,
        INVENTORY_FAILED,
        CANCELLED,
        REFUNDED
    }

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ShippingAddress {
        private String fullName;
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phone;
    }
}
