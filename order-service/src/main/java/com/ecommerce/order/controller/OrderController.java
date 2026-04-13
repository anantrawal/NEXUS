package com.ecommerce.order.controller;

import com.ecommerce.order.dto.OrderDTOs.*;
import com.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Email") String userEmail,
            @Valid @RequestBody PlaceOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(orderService.placeOrder(userId, userEmail, request));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrder(orderId, userId));
    }

    @GetMapping
    public ResponseEntity<OrderPageResponse> getUserOrders(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(userId, page, size));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, userId));
    }
}
