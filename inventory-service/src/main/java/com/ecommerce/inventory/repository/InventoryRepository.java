package com.ecommerce.inventory.repository;

import com.ecommerce.inventory.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Optional<Inventory> findByProductId(String productId);
    List<Inventory> findByAvailableQuantityLessThanEqual(int threshold);
}
