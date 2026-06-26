# NexaCart React Frontend

This is the production-grade React frontend for **NexaCart** – a Scalable Multi-Vendor E-Commerce Ecosystem.

## Technology Stack

* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Google Fonts (Outfit & Inter)
* **State Management**: Redux Toolkit (auth, cart, products)
* **Routing**: React Router 7
* **API Client**: Axios (with custom interceptors for JWT & cookie-based automatic token refreshes)
* **Forms**: React Hook Form, Zod validation
* **Graphics**: Recharts area & bar charts
* **Icons**: Lucide React

---

## Folder Structure

```
frontend/
├── Dockerfile              # Multi-stage production build configuration
├── src/
│   ├── assets/             # Assets and logos
│   ├── core/               # App-wide configurations and utilities
│   │   ├── api/            # Axios HTTP client configuration
│   │   ├── components/     # Layouts (Public, Dashboard) and common loaders
│   │   ├── hooks/          # Custom Hooks (useAuth, useCart)
│   │   └── router/         # AppRouter and ProtectedRoute shields
│   ├── features/           # Feature-based pages
│   │   ├── admin/          # Admin dashboards and approval tables
│   │   ├── auth/           # Login & Registration pages
│   │   ├── customer/       # Customer orders, cart lists, and checkout
│   │   ├── public/         # Shop catalog listing, details, categories, home
│   │   └── vendor/         # Vendor management panel and inventory
│   ├── store/              # Redux slices and typed hooks
│   ├── App.tsx             # Main App Router mount
│   ├── index.css           # Global Tailwind and Outfit/Inter Font directives
│   └── main.tsx            # App mounting point with Providers
```

---

## Design System

We employ custom dark theme aesthetics using a rich, tailored dark palette:
* **Background**: `#090d16` (Deep space grey)
* **Panels**: `.glass-panel` backdrop-filter blur card layout with `#111726` alpha colorings
* **Accent Primary**: Indigo (`#6366f1` / Indigo-600)
* **Visual Highlights**: Linear gradients, micro-animations, custom scrollbars, and Outfit fonts for headings.

---

## Authentication & Role-Based Access Control (RBAC)

1. **Authorization Shields**:
   * Public: Accessible to everyone.
   * Customer Panel: ROLE_CUSTOMER, ROLE_VENDOR, ROLE_ADMIN (e.g. checkout, cart).
   * Vendor Panel: ROLE_VENDOR only (e.g. products, stock levels).
   * Admin Panel: ROLE_ADMIN only (e.g. vendor approvals, catalog review).
2. **Axios Client Interceptors**:
   * Automatic bearer access token headers.
   * Auto-renew queue for expired access tokens calling `/api/v1/auth/refresh` without blocking concurrently outgoing requests.
   * Automatic redirection to `/login` if credentials expire.

---

## Getting Started

### 1. Requirements
* Node.js v20+

### 2. Development Setup
1. Move into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:3000`. API calls to `/api` will be proxied to `http://localhost:8080`.

### 3. Production Build
Build the optimized application assets:
```bash
npm run build
```
The compiled output will reside in the `dist/` directory.
