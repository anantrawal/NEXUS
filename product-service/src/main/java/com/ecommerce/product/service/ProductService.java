package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductDTOs.*;
import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public ProductPageResponse getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findByActiveTrue(pageable);
        return toPageResponse(products);
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toResponse(product);
    }

    public ProductPageResponse getProductsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByCategoryAndActiveTrue(category, pageable);
        return toPageResponse(products);
    }

    public ProductPageResponse searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.searchProducts(keyword, pageable);
        return toPageResponse(products);
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductPageResponse getProductsByPriceRange(BigDecimal min, BigDecimal max, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByPriceRange(min, max, pageable);
        return toPageResponse(products);
    }

    public ProductResponse createProduct(CreateProductRequest request) {
        Product product = Product.builder()
            .name(request.getName())
            .description(request.getDescription())
            .category(request.getCategory())
            .brand(request.getBrand())
            .price(request.getPrice())
            .originalPrice(request.getOriginalPrice())
            .imageUrl(request.getImageUrl())
            .images(request.getImages())
            .attributes(request.getAttributes())
            .tags(request.getTags())
            .featured(request.isFeatured())
            .active(true)
            .rating(0.0)
            .reviewCount(0)
            .build();

        product = productRepository.save(product);
        log.info("Created product: {}", product.getId());
        return toResponse(product);
    }

    public ProductResponse updateProduct(String id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) product.setOriginalPrice(request.getOriginalPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getImages() != null) product.setImages(request.getImages());
        if (request.getAttributes() != null) product.setAttributes(request.getAttributes());
        if (request.getTags() != null) product.setTags(request.getTags());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        if (request.getActive() != null) product.setActive(request.getActive());

        product = productRepository.save(product);
        log.info("Updated product: {}", id);
        return toResponse(product);
    }

    @CircuitBreaker(name = "inventory-service", fallbackMethod = "deleteProductFallback")
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        product.setActive(false);
        productRepository.save(product);
        log.info("Soft-deleted product: {}", id);
    }

    public void deleteProductFallback(String id, Exception ex) {
        log.warn("Circuit breaker triggered for deleteProduct: {}", ex.getMessage());
        throw new RuntimeException("Service temporarily unavailable. Please try again later.");
    }

    // ─── Mapping ────────────────────────────────────────────────────

    private ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setCategory(p.getCategory());
        r.setBrand(p.getBrand());
        r.setPrice(p.getPrice());
        r.setOriginalPrice(p.getOriginalPrice());
        r.setImageUrl(p.getImageUrl());
        r.setImages(p.getImages());
        r.setAttributes(p.getAttributes());
        r.setRating(p.getRating());
        r.setReviewCount(p.getReviewCount());
        r.setActive(p.isActive());
        r.setFeatured(p.isFeatured());
        r.setTags(p.getTags());
        r.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return r;
    }

    private ProductPageResponse toPageResponse(Page<Product> page) {
        ProductPageResponse r = new ProductPageResponse();
        r.setContent(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        r.setPage(page.getNumber());
        r.setSize(page.getSize());
        r.setTotalElements(page.getTotalElements());
        r.setTotalPages(page.getTotalPages());
        r.setLast(page.isLast());
        return r;
    }
}
