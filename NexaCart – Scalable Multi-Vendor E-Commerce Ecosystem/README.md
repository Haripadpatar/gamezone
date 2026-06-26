# NexaCart – Scalable Multi-Vendor E-Commerce Ecosystem

NexaCart is a production-grade, enterprise-ready multi-vendor e-commerce platform built using **Java 21**, **Spring Boot 3**, **PostgreSQL**, **Redis**, and **Spring Security**. Designed with architectural modularity, high performance, and strict security compliance, NexaCart resembles a real-world startup product and serves as a portfolio-worthy reference for software engineering roles.

---

## 🚀 Key Features

* **Authentication & RBAC**: Stateless JWT-based authentication with cookie-based token refresh mechanism. Custom role boundaries for `ROLE_CUSTOMER`, `ROLE_VENDOR`, and `ROLE_ADMIN`.
* **Vendor Store Management**: Vendor registration, admin approval flows, dynamic stores, and vendor-specific commission rates.
* **Cascading Catalog & Inventory**: Recursive category structures, product listings, cascades to variants (size/color/price modifiers), and real-time inventory levels.
* **Persistent Shopping Cart**: Syncing, updates, validation rules against variant stocks, and wishlist tracking.
* **Order & Payments Module**: Secure transaction checkouts, platform commission calculations, Razorpay transaction mock verify mechanisms, and vendor item-fulfillment states.
* **Redis Caching**: Caching of low-write, read-heavy endpoints (Active Categories, Product detail lookups) and analytics dashboards with automated Spring Cache evictions.
* **Dashboard Analytics**: Aggegated database metrics for Vendor store performance (earnings, products sold, order counts, monthly trends) and Admin platform oversight.

---

## 🛠️ Technology Stack

* **Backend Framework**: Spring Boot 3.3.0 (Java 21)
* **ORM & Database**: Spring Data JPA, Hibernate, PostgreSQL
* **Caching & Sessions**: Redis (Spring Boot Cache)
* **Security & Tokens**: Spring Security, JWT (jjwt)
* **Build Tool & Testing**: Maven, JUnit 5, MockMvc, H2 Database (Test Profile)
* **DevOps**: Docker, Docker Compose, GitHub Actions CI

---

## 📂 Project Architecture

NexaCart uses a **Package-by-Feature** modular design inside the service layers to keep related domain entities, repositories, and controllers grouped cohesively:

```
src/main/java/com/nexacart/backend/
├── global/
│   ├── config/             # Security, Cache, Async, Auditing Configs
│   ├── exception/          # Global Exception Handlers
│   ├── response/           # Standard API Envelope wrappers (ApiResponse)
│   └── util/               # Constants and general utilities
└── modules/
    ├── analytics/          # Sales stats, charts data, dashboards
    ├── auth/               # Access/Refresh token flows, signup, login
    ├── cart/               # Shopping cart & wishlist
    ├── order/              # Checkout, orders, item fulfillment
    ├── payment/            # Razorpay mocks and verifications
    ├── product/            # Products, Variants, Categories, Inventory
    └── user/               # Users, Profiles, Addresses, Roles
```

---

## 📡 API Endpoints

All API endpoints return a standardized JSON envelope structure:

```json
{
  "success": true,
  "message": "Resource successfully retrieved",
  "data": {},
  "errors": null,
  "timestamp": "2026-06-18T13:46:00Z"
}
```

### Key Endpoints

| Category | Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register` | POST | Public | Customer registration |
| **Auth** | `/api/v1/auth/login` | POST | Public | Returns Access & HTTP-Only Refresh Token |
| **Auth** | `/api/v1/auth/refresh` | POST | Public | Refreshes access token via cookie |
| **Vendor** | `/api/v1/vendors/register` | POST | Customer | Apply to become a vendor |
| **Vendor** | `/api/v1/admin/vendors/{id}/approve` | POST | Admin | Approves/rejects store registration |
| **Catalog** | `/api/v1/categories` | GET | Public | Category hierarchy tree (Cached) |
| **Catalog** | `/api/v1/products/{slug}` | GET | Public | Detailed product details + variants (Cached) |
| **Catalog** | `/api/v1/products` | GET | Public | Dynamic paginated specification search |
| **Cart** | `/api/v1/cart` | GET/POST/PUT | Customer | Cart item changes and stock validations |
| **Order** | `/api/v1/orders` | POST | Customer | Place order & generate Razorpay order ID |
| **Payment** | `/api/v1/payments/verify` | POST | Customer | Signature verification and order updates |
| **Analytics**| `/api/v1/vendor/analytics` | GET | Vendor | Sales dashboard statistics (Cached) |
| **Analytics**| `/api/v1/admin/analytics` | GET | Admin | Global metrics and platform sales |

---

## 💻 How to Run the Project

### Prerequisites
* Java 21 SDK
* Maven 3.8+
* Docker & Docker Compose (optional)

### 1. Running with Docker Compose (Recommended)
This spins up PostgreSQL, Redis, and the Spring Boot application fully configured:

```bash
docker compose up --build
```
The application will start on `http://localhost:8080`.

### 2. Running Locally (Development Mode)
First, ensure you have PostgreSQL running on port `5432` with database `nexacart` and Redis running on port `6379`.

Configure DB credentials in `src/main/resources/application-dev.yml` if different. Then build and run:

```bash
mvn clean install
mvn spring-boot:run
```

### 3. Running the Test Suite
NexaCart features a comprehensive integration test suite utilizing in-memory H2 database configurations to guarantee REST API logic correctness:

```bash
mvn clean test
```

---

## ⚙️ Caching Policies

Read-heavy, low-frequency write operations are cached using Redis. Eviction rules are applied at service boundaries:
* **Categories**: Cached on fetching hierarchy tree; evicted entirely on creation, updates, and deletion.
* **Products**: Cached on slug lookups; evicted on updating, deleting, or admin moderation events.
* **Analytics**: Cached with a 5-minute TTL; evicted when new orders are marked as PAID or item fulfillment updates occur.
