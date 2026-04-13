package com.ecommerce.cart.controller;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.service.CartService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody AddItemRequest request) {
        Cart.CartItem item = Cart.CartItem.builder()
            .productId(request.getProductId())
            .productName(request.getProductName())
            .imageUrl(request.getImageUrl())
            .price(request.getPrice())
            .quantity(request.getQuantity())
            .category(request.getCategory())
            .build();
        return ResponseEntity.ok(cartService.addItem(userId, item));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateQuantity(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String productId,
            @RequestBody UpdateQuantityRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, request.getQuantity()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItem(userId, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestHeader("X-User-Id") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/coupon")
    public ResponseEntity<Cart> applyCoupon(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CouponRequest request) {
        return ResponseEntity.ok(cartService.applyCoupon(userId, request.getCouponCode()));
    }

    @Data
    public static class AddItemRequest {
        private String productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private int quantity;
        private String category;
    }

    @Data
    public static class UpdateQuantityRequest {
        private int quantity;
    }

    @Data
    public static class CouponRequest {
        private String couponCode;
    }
}
