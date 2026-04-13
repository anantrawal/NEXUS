package com.ecommerce.order.repository;

import com.ecommerce.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, Order.OrderStatus status);

    Optional<Order> findBySagaId(String sagaId);

    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDING','PAYMENT_INITIATED') " +
           "AND o.createdAt < :cutoff")
    List<Order> findStalePendingOrders(LocalDateTime cutoff);

    long countByUserId(String userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(String id);
}
