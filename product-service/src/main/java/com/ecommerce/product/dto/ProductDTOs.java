package com.ecommerce.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ProductDTOs {

    @Data
    public static class CreateProductRequest {
        @NotBlank
        private String name;

        @NotBlank
        private String description;

        @NotBlank
        private String category;

        private String brand;

        @NotNull
        @DecimalMin("0.01")
        private BigDecimal price;

        private BigDecimal originalPrice;
        private String imageUrl;
        private List<String> images;
        private Map<String, Object> attributes;
        private List<String> tags;
        private boolean featured;
    }

    @Data
    public static class UpdateProductRequest {
        private String name;
        private String description;
        private String category;
        private String brand;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String imageUrl;
        private List<String> images;
        private Map<String, Object> attributes;
        private List<String> tags;
        private Boolean featured;
        private Boolean active;
    }

    @Data
    public static class ProductResponse {
        private String id;
        private String name;
        private String description;
        private String category;
        private String brand;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String imageUrl;
        private List<String> images;
        private Map<String, Object> attributes;
        private double rating;
        private int reviewCount;
        private boolean active;
        private boolean featured;
        private List<String> tags;
        private String createdAt;
    }

    @Data
    public static class ProductPageResponse {
        private List<ProductResponse> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
