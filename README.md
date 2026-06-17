# AGX — Premium Online Gaming Technology Platform

AGX is a modern full-stack gaming platform designed to demonstrate scalable software architecture, secure wallet management, real-time communication systems, and enterprise-grade backend development.

The platform combines a React + TypeScript frontend with a Spring Boot backend, PostgreSQL persistence, Redis caching, JWT authentication, WebSocket communication, and Dockerized deployment.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion

### Backend

* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* WebSocket (STOMP + SockJS)

### Database & Infrastructure

* PostgreSQL
* Redis
* Docker
* Docker Compose

## Key Features

### User Platform

* User Registration & Login
* JWT Authentication
* OTP Verification Architecture
* Wallet Management
* Transaction History
* Referral System
* VIP Progress System
* Notifications Center

### Gaming Modules

* Mines
* Crash
* Slots
* Roulette
* Plinko
* Wheel Spin
* Dice
* Blackjack
* Color Prediction

### Real-Time Systems

* Global Lobby Chat
* Live Notifications
* WebSocket Event Broadcasting
* Tournament Updates

### Wallet & Security

* Main Balance
* Bonus Balance
* Locked Balance
* Transaction Tracking
* Pessimistic Database Locking
* Double-Spend Protection
* Role-Based Access Control

### Administration

* Admin Dashboard
* User Management
* Wallet Monitoring
* Transaction Management
* Notification Management

## Project Structure

```text
gamezone/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Building the Frontend

```bash
npm run build
```

The production build is generated in:

```text
frontend/dist
```

## Running the Backend

Prerequisites:

* Java 17+
* PostgreSQL
* Redis

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

## Docker Deployment

```bash
docker-compose up --build -d
```

Services:

* PostgreSQL
* Redis
* Spring Boot Backend

Stop services:

```bash
docker-compose down -v
```

## Security Features

* JWT Authentication
* Role-Based Access Control
* OTP Service Architecture
* Secure Password Storage
* WebSocket Security
* Transaction Validation
* Double-Spend Protection

## Learning Outcomes

This project demonstrates:

* Full Stack Development
* REST API Design
* Authentication & Authorization
* Database Design
* Real-Time Communication
* Containerization with Docker
* State Management
* Secure Transaction Processing
* Scalable System Architecture

## Future Enhancements

* Payment Gateway Integration
* Email Provider Integration
* SMS Provider Integration
* CI/CD Pipeline
* Cloud Deployment
* Monitoring & Observability
* Automated Testing Coverage

## Author

Haripad Patar

B.Tech CSE | Java Full Stack Developer | 2027 Graduate

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
