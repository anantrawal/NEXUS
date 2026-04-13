# NEXUS — Production-Level E-Commerce Platform

A full microservices e-commerce platform built with Spring Boot 3.x, Kafka, Redis, MongoDB, PostgreSQL, and React.js.

---

## 🏗 Architecture Overview

```
Browser (React)
      │
      ▼
API Gateway :8080          ← JWT auth filter, routing, CORS
      │
      ├──► Auth Service :8081        (PostgreSQL)
      ├──► Product Service :8082     (MongoDB + Resilience4j)
      ├──► Cart Service :8083        (Redis)
      ├──► Order Service :8084       (PostgreSQL + Saga Orchestrator)
      ├──► Payment Service :8085     (Kafka consumer + Stripe stub)
      └──► Inventory Service :8086   (MongoDB + Kafka consumer)

Kafka ──► Order → Payment → Inventory (Saga events)
```

---

## 📦 Tech Stack

| Layer           | Technology                                  |
|-----------------|---------------------------------------------|
| Frontend        | React 18, Redux Toolkit, React Router 6     |
| API Gateway     | Spring Cloud Gateway 3.x                    |
| Backend         | Spring Boot 3.2, Java 17                    |
| Auth            | Spring Security + JWT (jjwt 0.12)           |
| Databases       | PostgreSQL 15, MongoDB 7, Redis 7           |
| Messaging       | Apache Kafka 7.5 (Confluent)                |
| Resilience      | Resilience4j (circuit breaker + retry)      |
| Infrastructure  | Docker + Docker Compose                     |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (with at least 8GB RAM allocated)
- Docker Compose v2

### 1. Clone and start

```bash
git clone <repo-url>
cd ecommerce-platform
docker-compose up -d
```

This brings up **12 containers**: Zookeeper, Kafka, Kafka UI, PostgreSQL ×2, MongoDB, Redis, and all 6 microservices + frontend.

### 2. Wait for health checks (~60-90 seconds)

```bash
docker-compose ps   # all should show "healthy" or "running"
```

### 3. Seed product data

```bash
docker exec -it mongodb mongosh \
  "mongodb://mongo_user:mongo_pass@localhost:27017/product_db?authSource=admin" \
  /seed-products.js

# Or copy the file in first:
docker cp seed-products.js mongodb:/seed-products.js
docker exec -it mongodb mongosh \
  "mongodb://mongo_user:mongo_pass@localhost:27017/product_db?authSource=admin" \
  /seed-products.js
```

### 4. Open the app

| Service          | URL                          |
|------------------|------------------------------|
| Frontend         | http://localhost:3000        |
| API Gateway      | http://localhost:8080        |
| Kafka UI         | http://localhost:8090        |

---

## 🔑 API Endpoints

All routes go through the API Gateway at `:8080`.

### Auth (public)
```
POST /api/auth/register   { username, email, password, firstName, lastName }
POST /api/auth/login      { email, password }
POST /api/auth/refresh    { refreshToken }
```

### Products (GET public, mutations require JWT)
```
GET  /api/products?page=0&size=12&sortBy=createdAt&sortDir=desc
GET  /api/products/{id}
GET  /api/products/category/{category}
GET  /api/products/search?keyword=sony
GET  /api/products/featured
POST /api/products         (requires ADMIN role)
PUT  /api/products/{id}    (requires ADMIN role)
```

### Cart (JWT required)
```
GET    /api/cart
POST   /api/cart/items      { productId, productName, price, quantity, imageUrl }
PUT    /api/cart/items/{id} { quantity }
DELETE /api/cart/items/{id}
DELETE /api/cart
```

### Orders (JWT required)
```
POST /api/orders            { items, shippingAddress, paymentToken, paymentMethod }
GET  /api/orders            ?page=0&size=10
GET  /api/orders/{id}
POST /api/orders/{id}/cancel
```

---

## 🔄 Saga Flow (Distributed Transactions)

```
User places order
       │
       ▼
OrderService.placeOrder()
  → saves Order (PENDING)
  → publishes PaymentRequestEvent to Kafka
       │
       ▼
PaymentService (consumer)
  → processes payment via Stripe
  → publishes PaymentResultEvent
       │
  ┌────┴────┐
SUCCESS    FAILURE
  │           └─→ Order marked PAYMENT_FAILED
  ▼
OrderService handles PaymentResult
  → Order status: PAYMENT_COMPLETED
  → publishes InventoryReserveEvent
       │
       ▼
InventoryService (consumer)
  → atomically checks + reserves stock
  → publishes InventoryResultEvent
       │
  ┌────┴────┐
SUCCESS    FAILURE
  │           └─→ publishes PaymentRefundEvent (compensating tx)
  ▼                └─→ Order marked CANCELLED
Order marked CONFIRMED
  → publishes OrderCompletedEvent
  → (notification service would listen here)
```

---

## 🔌 Stripe Integration

The payment service currently runs in stub mode. To enable real Stripe payments:

1. Add your Stripe secret key to `docker-compose.yml`:
   ```yaml
   STRIPE_SECRET_KEY: sk_live_...
   ```

2. Uncomment the Stripe SDK in `payment-service/pom.xml`

3. Replace the stub in `PaymentKafkaHandler.java`:
   ```java
   Stripe.apiKey = stripeSecretKey;
   PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
       .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
       .setCurrency("usd")
       .setPaymentMethod(token)
       .setConfirm(true)
       .build();
   PaymentIntent intent = PaymentIntent.create(params);
   ```

4. In the frontend `CheckoutPage.js`, replace `paymentToken: 'tok_visa'` with a Stripe.js `PaymentElement` integration.

---

## 🛠 Development

### Run a single service locally

```bash
# Start infra only
docker-compose up -d zookeeper kafka postgres-auth postgres-order mongodb redis

# Run auth-service locally
cd auth-service
mvn spring-boot:run
```

### View Kafka topics

Open http://localhost:8090 (Kafka UI) to watch events flow through the Saga in real time.

### Useful commands

```bash
# Tail logs from all services
docker-compose logs -f

# Tail just the order service
docker-compose logs -f order-service

# Restart a single service
docker-compose restart order-service

# Rebuild after code changes
docker-compose up -d --build order-service
```

---

## 📁 Project Structure

```
ecommerce-platform/
├── docker-compose.yml
├── seed-products.js
├── api-gateway/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/ecommerce/gateway/
│       ├── ApiGatewayApplication.java
│       ├── filter/AuthenticationFilter.java
│       └── resources/application.yml
├── auth-service/
├── product-service/
├── cart-service/
├── order-service/
│   └── saga/OrderSagaOrchestrator.java  ← Core Saga logic
├── payment-service/
├── inventory-service/
└── frontend/
    └── src/
        ├── pages/         (HomePage, ProductsPage, CheckoutPage, OrdersPage…)
        ├── components/    (Navbar, CartDrawer, ProductCard)
        ├── store/slices/  (authSlice, cartSlice)
        └── services/api.js
```

---

## 🔭 Observability (Next Steps)

Add distributed tracing with Zipkin:

```yaml
# Add to each service's application.yml:
management:
  tracing:
    sampling:
      probability: 1.0
zipkin:
  base-url: http://zipkin:9411
```

```yaml
# Add to docker-compose.yml:
zipkin:
  image: openzipkin/zipkin:latest
  ports:
    - "9411:9411"
```

---

## ⚠️ Production Hardening Checklist

- [ ] Replace JWT secret with a proper secret manager (AWS Secrets Manager / Vault)
- [ ] Enable TLS on all inter-service communication
- [ ] Add Kubernetes manifests (Deployments, Services, Ingress)
- [ ] Configure Kafka with replication factor ≥ 3
- [ ] Add dead-letter queues for failed Saga events
- [ ] Enable PostgreSQL connection pooling (PgBouncer)
- [ ] Add rate limiting on API Gateway
- [ ] Set up structured logging (ELK stack or Loki/Grafana)
- [ ] Add health check probes to K8s Deployments
