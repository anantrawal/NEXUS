package com.ecommerce.product.repository;

import com.ecommerce.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    Page<Product> findByBrandAndActiveTrue(String brand, Pageable pageable);

    List<Product> findByFeaturedTrueAndActiveTrue();

    @Query("{ 'active': true, '$or': [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } }, " +
           "{ 'tags': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> searchProducts(String keyword, Pageable pageable);

    @Query("{ 'active': true, 'price': { $gte: ?0, $lte: ?1 } }")
    Page<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    List<Product> findByCategoryAndActiveTrueAndIdNot(String category, String id, Pageable pageable);

    long countByCategoryAndActiveTrue(String category);
}
