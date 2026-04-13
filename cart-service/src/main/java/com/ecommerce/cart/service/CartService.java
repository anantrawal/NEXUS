package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private static final String CART_KEY_PREFIX = "cart:";

    private final RedisTemplate<String, Cart> cartRedisTemplate;

    @Value("${cart.ttl-seconds:86400}")
    private long cartTtlSeconds;

    public Cart getCart(String userId) {
        String key = CART_KEY_PREFIX + userId;
        Cart cart = cartRedisTemplate.opsForValue().get(key);
        if (cart == null) {
            cart = Cart.builder().userId(userId).build();
        }
        return cart;
    }

    public Cart addItem(String userId, Cart.CartItem item) {
        Cart cart = getCart(userId);
        cart.addItem(item);
        saveCart(userId, cart);
        log.debug("Added item {} to cart for user {}", item.getProductId(), userId);
        return cart;
    }

    public Cart updateItemQuantity(String userId, String productId, int quantity) {
        Cart cart = getCart(userId);
        cart.updateQuantity(productId, quantity);
        saveCart(userId, cart);
        return cart;
    }

    public Cart removeItem(String userId, String productId) {
        Cart cart = getCart(userId);
        cart.removeItem(productId);
        saveCart(userId, cart);
        log.debug("Removed item {} from cart for user {}", productId, userId);
        return cart;
    }

    public void clearCart(String userId) {
        String key = CART_KEY_PREFIX + userId;
        cartRedisTemplate.delete(key);
        log.info("Cleared cart for user {}", userId);
    }

    public Cart applyCoupon(String userId, String couponCode) {
        Cart cart = getCart(userId);
        // In production: validate coupon from a coupon service
        // For now: apply a 10% discount as demo
        if ("SAVE10".equalsIgnoreCase(couponCode)) {
            BigDecimal discount = cart.getTotalPrice().multiply(BigDecimal.valueOf(0.10));
            log.info("Applied coupon {} - discount: {}", couponCode, discount);
        }
        return cart;
    }

    private void saveCart(String userId, Cart cart) {
        String key = CART_KEY_PREFIX + userId;
        cartRedisTemplate.opsForValue().set(key, cart, cartTtlSeconds, TimeUnit.SECONDS);
    }
}
