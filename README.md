# Legacy Radio – Fullstack Communication Platform

**Legacy Radio** is a scalable voice communication platform designed for use in commercial truck environments. Built for both Android and iOS, the platform enables secure server-based VoIP communication with custom hardware integration, subscriptions, and admin-controlled access.

Developed and maintained by **Legacy DEV Team**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Subscription Logic](#subscription-logic)
- [Discount Code System](#discount-code-system)
- [Mobile App](#mobile-app)
- [License](#license)

---

## Features

- JWT-based user registration/login
- Subscriptions with Stripe & PayPal integration
- Admin-only discount codes
- Multi-server support (1 active connection at a time)
- Admin dashboard to manage servers and codes
- Cross-platform mobile app (Flutter)
- Push-to-Talk & configurable physical buttons (Android)
- Docker-hosted server infrastructure via Pelican Panel

---

## Tech Stack

**Frontend:**  
- React (Vite)  
- Zustand or Redux Toolkit  
- TailwindCSS or Material UI  

**Backend:**  
- Node.js (Express)  
- MySQL/MariaDB  
- Sequelize ORM  
- JWT Authentication  
- Stripe SDK + PayPal API  

**Mobile App:**  
- Flutter (Dart)  
- WebRTC or UDP-based VoIP  
- Android hardware integration  
- iOS compatibility  

**Servers:**  
- Docker (Linux)  
- Managed with Pelican Panel  
- TLS encryption  
- Token-authenticated voice containers  

---

## Architecture

```plaintext
[User App]
   |
[Web API (JWT)] — REST
   |
[MySQL Database]
   |
[Docker Containers (Voice Servers)]
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- Flutter SDK (for mobile app)
- Docker & Pelican Panel (for server deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Legacy-DEV-Team/legacy-radio.git
   cd legacy-radio
   ```

2. Setup environment variables:
   - Copy `.env.example` to `.env` in both `/backend` and `/frontend`
   - Add your `STRIPE_SECRET_KEY`, `DB_HOST`, etc.

3. Start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. Start frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. Run Flutter app (optional):
   ```bash
   cd ../app
   flutter pub get
   flutter run
   ```

---

## Folder Structure

```
legacy-radio/
├── backend/               # Node.js Express backend
├── frontend/              # React Vite frontend
├── app/                   # Flutter mobile app (iOS & Android)
├── docker/                # (Planned) Voice server containers
└── README.md
```

---

## Subscription Logic

- Subscriptions renew on the **1st of each month**
- Durations: 1, 3, 6, or 12 months
- A user can subscribe to multiple servers simultaneously
- All payment handling via Stripe/PayPal
- Access is revoked if payment is missed

---

## Discount Code System

- Admin can generate alphanumeric codes (e.g. `LR2025ABC`)
- Codes can:
  - Grant free access until a set date
  - Be server-specific
  - Have limited usage
- Tracked in the database

---

## Mobile App

- Written in Flutter
- Supports Android radios with physical button mapping
- Uses REST API for login, subscription validation, server list
- Connects to one server at a time (via VoIP engine)
- iOS support via TestFlight

---

## License

This project is licensed under the **MIT License**.  
© 2025 Legacy DEV Team. All rights reserved.

---