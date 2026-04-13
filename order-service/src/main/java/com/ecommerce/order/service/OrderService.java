package com.ecommerce.order.service;

import com.ecommerce.order.dto.OrderDTOs.*;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.Order.OrderStatus;
import com.ecommerce.order.model.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.saga.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderSagaOrchestrator sagaOrchestrator;

    @Transactional
    public OrderResponse placeOrder(String userId, String userEmail, PlaceOrderRequest request) {
        // Build order items
        List<OrderItem> items = request.getItems().stream().map(itemReq -> {
            BigDecimal total = itemReq.getUnitPrice()
                .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            return OrderItem.builder()
                .productId(itemReq.getProductId())
                .productName(itemReq.getProductName())
                .imageUrl(itemReq.getImageUrl())
                .quantity(itemReq.getQuantity())
                .unitPrice(itemReq.getUnitPrice())
                .totalPrice(total)
                .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
            .map(OrderItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingCost = subtotal.compareTo(BigDecimal.valueOf(50)) >= 0
            ? BigDecimal.ZERO   // free shipping over $50
            : BigDecimal.valueOf(5.99);

        BigDecimal total = subtotal.add(shippingCost);

        // Build shipping address
        Order.ShippingAddress address = new Order.ShippingAddress(
            request.getShippingAddress().getFullName(),
            request.getShippingAddress().getStreet(),
            request.getShippingAddress().getCity(),
            request.getShippingAddress().getState(),
            request.getShippingAddress().getPostalCode(),
            request.getShippingAddress().getCountry(),
            request.getShippingAddress().getPhone()
        );

        Order order = Order.builder()
            .userId(userId)
            .userEmail(userEmail)
            .status(OrderStatus.PENDING)
            .subtotal(subtotal)
            .discount(BigDecimal.ZERO)
            .shippingCost(shippingCost)
            .totalAmount(total)
            .shippingAddress(address)
            .build();

        order = orderRepository.save(order);

        // Link items back to order
        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);
        order = orderRepository.save(order);

        // Kick off the Saga
        sagaOrchestrator.startSaga(order, request.getPaymentToken(), request.getPaymentMethod());

        log.info("Order placed: {} for user: {} total: {}", order.getId(), userId, total);
        return toResponse(order);
    }

    public OrderResponse getOrder(String orderId, String userId) {
        Order order = orderRepository.findByIdWithItems(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied to order: " + orderId);
        }
        return toResponse(order);
    }

    public OrderPageResponse getUserOrders(String userId, int page, int size) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(
            userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        OrderPageResponse response = new OrderPageResponse();
        response.setContent(orders.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        response.setPage(orders.getNumber());
        response.setSize(orders.getSize());
        response.setTotalElements(orders.getTotalElements());
        response.setTotalPages(orders.getTotalPages());
        response.setLast(orders.isLast());
        return response;
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId, String userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        // Can only cancel PENDING or CONFIRMED orders
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setFailureReason("Cancelled by user");
        order = orderRepository.save(order);
        log.info("Order {} cancelled by user {}", orderId, userId);
        return toResponse(order);
    }

    // ─── Mapper ─────────────────────────────────────────────────

    private OrderResponse toResponse(Order o) {
        OrderResponse r = new OrderResponse();
        r.setId(o.getId());
        r.setUserId(o.getUserId());
        r.setStatus(o.getStatus().name());
        r.setSagaId(o.getSagaId());
        r.setSubtotal(o.getSubtotal());
        r.setDiscount(o.getDiscount());
        r.setShippingCost(o.getShippingCost());
        r.setTotalAmount(o.getTotalAmount());
        r.setPaymentId(o.getPaymentId());
        r.setPaymentMethod(o.getPaymentMethod());
        r.setFailureReason(o.getFailureReason());
        r.setCreatedAt(o.getCreatedAt());
        r.setUpdatedAt(o.getUpdatedAt());

        if (o.getItems() != null) {
            r.setItems(o.getItems().stream().map(i -> {
                OrderItemResponse ir = new OrderItemResponse();
                ir.setId(i.getId());
                ir.setProductId(i.getProductId());
                ir.setProductName(i.getProductName());
                ir.setImageUrl(i.getImageUrl());
                ir.setQuantity(i.getQuantity());
                ir.setUnitPrice(i.getUnitPrice());
                ir.setTotalPrice(i.getTotalPrice());
                return ir;
            }).collect(Collectors.toList()));
        }

        if (o.getShippingAddress() != null) {
            ShippingAddressResponse ar = new ShippingAddressResponse();
            ar.setFullName(o.getShippingAddress().getFullName());
            ar.setStreet(o.getShippingAddress().getStreet());
            ar.setCity(o.getShippingAddress().getCity());
            ar.setState(o.getShippingAddress().getState());
            ar.setPostalCode(o.getShippingAddress().getPostalCode());
            ar.setCountry(o.getShippingAddress().getCountry());
            ar.setPhone(o.getShippingAddress().getPhone());
            r.setShippingAddress(ar);
        }
        return r;
    }
}
