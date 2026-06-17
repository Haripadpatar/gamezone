# AGX — Premium Online Gaming Technology Platform

AGX is a next-generation, high-performance online gaming and digital entertainment platform designed with a dark luxury user experience, secure transactional database wallets, cryptographic provably fair engines, real-time STOMP WebSocket communications, and Dockerized deployment.

---

## 📁 Repository Structure

The project is organized as a monorepo containing:
*   **`/frontend`**: React + TypeScript client powered by Vite, Tailwind CSS, and Framer Motion. Contains 9 fully interactive games, a VIP progress lounge, affiliate referral tree charts, secure wallet forms, and ad placements.
*   **`/backend`**: Production-ready Spring Boot (Java 17) backend API service. Implements JPA repository database persistence, JWT filter authorization, Redis-backed OTP services, transactional double-spend protections, and WebSocket message brokers.

---

## ⚡ Deployment & Running Locally (Recommended)

The easiest way to run the entire AGX backend service stack is using Docker Compose. This automatically spins up, configures, and links PostgreSQL, Redis, and the Spring Boot application.

### 1. Unified Launch with Docker Compose
From the root directory of the repository, execute:
```bash
docker-compose up --build -d
```

This starts three services:
1.  **`agx-postgres`**: PostgreSQL database running on port `5432`, initialized automatically with the schema definitions.
2.  **`agx-redis`**: Redis server running on port `6379` handling temporary OTP storage.
3.  **`agx-backend`**: Spring Boot application running on port `8080`, configured to connect to the postgres and redis containers.

To monitor logs:
```bash
docker-compose logs -f backend
```

To tear down:
```bash
docker-compose down -v
```

---

## ☕ Manual Backend Execution (Development Mode)

If you prefer to run the Spring Boot application locally outside of Docker:

### Prerequisites
*   **JDK 17 or 21+** (Project Lombok version is upgraded to `1.18.46` to support compiler environments up to JDK 23/24).
*   **PostgreSQL** database active on port `5432` with a database named `antigravity`.
*   **Redis** active on port `6379`.

### Steps
1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```
2.  **Compile & Test**:
    ```bash
    mvn clean test
    ```
3.  **Run the Spring Boot application**:
    ```bash
    mvn spring-boot:run
    ```
    The application will run on [http://localhost:8080](http://localhost:8080).

---

## 💻 Running the Frontend Client

To run the interactive UI client:
1.  **Navigate to the frontend folder**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Launch the development server**:
    ```bash
    npm run dev
    ```
    The client will open on [http://localhost:5173](http://localhost:5173).

---

## 🔐 Authentication, Security & OTP Flow

*   **JWT Security Filters**: The Spring Boot backend intercepts HTTP requests using `JwtAuthenticationFilter`. Requests must carry a `Bearer <token>` payload in the `Authorization` header to access protected routes.
*   **Email & SMS OTP**: 
    *   Initiate verifications via `/api/auth/otp/send-email` or `/api/auth/otp/send-phone`.
    *   OTPs are temporarily cached in Redis (5-minute TTL).
    *   During development, the active OTP code is logged directly to the console output for easy sandboxing and testing.

---

## 💳 Concurrency & Transactional Wallets

*   **Balance Division**: Wallets are divided into Main, Bonus, and Locked balances.
*   **Pessimistic Locking**: The backend uses database write locks (`LockModeType.PESSIMISTIC_WRITE`) during transaction updates in `WalletService.java` to prevent concurrency flaws, race conditions, or double-spending during rapid bet submissions.
*   **Payment Webhooks**: The `/api/payment/webhook` endpoint accepts transaction capture callbacks, verifies the `X-Razorpay-Signature` signature using a secure HMAC SHA-256 key, and automatically credits user balances.

---

## 🛰️ Real-Time WebSocket Infrastructure

AGX utilizes a STOMP message broker to route real-time data:
*   **Websocket Endpoint**: `/ws` (supports SockJS fallback).
*   **Global Lobby Chat**: Send messages to `/app/chat.send`, which parses and persists them before broadcasting to `/topic/chat`.
*   **User Alerts**: Real-time balance changes, KYC approvals, and system alerts are pushed directly to user-specific channels: `/user/queue/notifications`.

---

## 🎮 Game Modes Included
1.  **Mines**: 5x5 mine sweep. Choose grid difficulty and cash out safely.
2.  **Crash Rocket**: Canvas-based rocket launch curves. Cash out before explosion.
3.  **Golden Slots**: 3-reel spinner machine matching fruit icons.
4.  **Roulette Royale**: Layout coordinates table betting Red/Black or specific digits.
5.  **Plinko Drop**: Canvas physical peg bounces landing in multiplier buckets.
6.  **Wheel Spin**: Lucky wheel segment spins with customized prize indicators.
7.  **Cyber Dice**: Slider Roll Under/Over calculations matching chances.
8.  **Blackjack**: Dealer vs player cards, hitting, standing, and score checks.
9.  **Color Prediction**: 15-second cycles to bet Red, Green, Violet, or numbers.
