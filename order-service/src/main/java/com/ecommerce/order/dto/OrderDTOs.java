package com.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTOs {

    @Data
    public static class PlaceOrderRequest {
        @NotEmpty
        private List<OrderItemRequest> items;

        @NotNull
        private ShippingAddressRequest shippingAddress;

        @NotBlank
        private String paymentMethod;

        // Stripe PaymentMethod ID from frontend
        private String paymentToken;

        private String couponCode;
    }

    @Data
    public static class OrderItemRequest {
        @NotBlank
        private String productId;
        @NotBlank
        private String productName;
        private String imageUrl;
        @NotNull
        private BigDecimal unitPrice;
        private int quantity = 1;
    }

    @Data
    public static class ShippingAddressRequest {
        @NotBlank private String fullName;
        @NotBlank private String street;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String postalCode;
        @NotBlank private String country;
        private String phone;
    }

    @Data
    public static class OrderResponse {
        private String id;
        private String userId;
        private String status;
        private String sagaId;
        private List<OrderItemResponse> items;
        private BigDecimal subtotal;
        private BigDecimal discount;
        private BigDecimal shippingCost;
        private BigDecimal totalAmount;
        private String paymentId;
        private String paymentMethod;
        private ShippingAddressResponse shippingAddress;
        private String failureReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class OrderItemResponse {
        private String id;
        private String productId;
        private String productName;
        private String imageUrl;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    public static class ShippingAddressResponse {
        private String fullName;
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phone;
    }

    @Data
    public static class OrderPageResponse {
        private List<OrderResponse> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
