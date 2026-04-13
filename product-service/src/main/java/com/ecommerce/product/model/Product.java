package com.ecommerce.product.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    private String id;

    @TextIndexed
    private String name;

    @TextIndexed
    private String description;

    @Indexed
    private String category;

    @Indexed
    private String brand;

    private BigDecimal price;
    private BigDecimal originalPrice;

    private String imageUrl;
    private List<String> images;

    // Flexible attributes: color, size, RAM, etc.
    private Map<String, Object> attributes;

    private double rating;
    private int reviewCount;

    @Indexed
    private boolean active = true;

    private boolean featured;

    private List<String> tags;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
