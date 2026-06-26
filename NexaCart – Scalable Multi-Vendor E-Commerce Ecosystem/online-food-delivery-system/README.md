# FreshCut Hub - Non-Veg Shop Delivery Web Application

FreshCut Hub is a production-ready, mobile-first, scalable Multi-Vendor Food Delivery-style web application tailored for local non-veg shops. Customers can browse chicken, mutton, seafood, and eggs, select quantities in weight-based (kg) or unit increments, compute distance-based delivery fees via Google Maps APIs, place orders, track delivery progress, and send order summaries over WhatsApp. Shop owners can manage categories, products, orders, delivery zones, and shop profile settings through a clean, premium dashboard.

---

## 1. Directory Structure

```
online-food-delivery-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/nonvegshop/delivery/
│   │   │   │   ├── config/             # JWT Utilities, Security & CORS configs
│   │   │   │   ├── controller/         # REST Controllers (Auth, Product, Orders, Settings)
│   │   │   │   ├── dto/                # Request & Response Data Transfer Objects
│   │   │   │   ├── entity/             # JPA Database Mappings (User, Order, Product, etc.)
│   │   │   │   ├── exception/          # Global Exception Handler and custom exceptions
│   │   │   │   ├── repository/         # Database Spring Data JPA Interfaces
│   │   │   │   ├── service/            # Core Business Logic & Google Maps/Cloudinary integrations
│   │   │   │   └── DeliveryApplication.java # Main Spring Boot Entry Point
│   │   │   └── resources/
│   │   │       ├── application.properties # Main application properties
│   │   │       └── schema.sql          # DB schema fallback (if run by initializer)
│   │   └── test/                       # Spring Boot Mock tests
│   ├── pom.xml                         # Maven dependencies & build configurations
│   └── README.md                       # Backend specific documentation
├── frontend/
│   ├── src/
│   │   ├── assets/                     # Images and static assets
│   │   ├── components/                 # Shared UI elements (Navbar, Footer, AdminNav, Route guards)
│   │   ├── context/                    # React Contexts (AuthContext, CartContext)
│   │   ├── pages/
│   │   │   ├── admin/                  # Dashboard, Products, Orders, Categories, Settings Management
│   │   │   └── customer/               # Home, Catalog, Details, Cart, Checkout, Tracking
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with JWT request interceptors
│   │   ├── App.jsx                     # Central Route definitions
│   │   ├── index.css                   # Custom global styles and Tailwind v4 imports
│   │   └── main.jsx                    # React main entry point
│   ├── package.json                    # Frontend package dependencies
│   ├── vite.config.js                  # Vite server proxies & plugin config
│   └── index.html                      # HTML root template with SEO metadata
├── schema.sql                          # Database MySQL initialization script
└── README.md                           # Main project documentation
```

---

## 2. Environment Variables Configuration

### A. Backend (`backend/src/main/resources/application.properties`)
Create or configure these properties in your environment settings or environment file:

```properties
# Database settings
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nonveg_delivery
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT configuration
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970 # Replace with a strong key in prod
JWT_EXPIRATION_MS=604800000 # 7 Days

# Cloudinary image storage (Required for uploading custom images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Maps API (Required for live geocoding & road distance calculations)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### B. Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend` folder for custom endpoints:

```env
VITE_API_URL=/api
```
*Note: During local development, Vite proxies `/api` directly to `http://localhost:8080/api` to avoid CORS conflicts.*

---

## 3. Database Setup (MySQL)

Create a MySQL database named `nonveg_delivery` and execute `schema.sql` found in the root directory:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nonveg_delivery;"
mysql -u root -p nonveg_delivery < schema.sql
```

The script initializes:
- All tables with constraints.
- Default categories: `Chicken`, `Mutton`, `Fish`, `Egg`, `Others`.
- Default shop settings and delivery fee tiers (₹50 for 0-3 km, ₹80 for 3-6 km, ₹120 for 6-10 km).

---

## 4. REST API Documentation

### Public Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| **POST** | `/api/auth/register` | Register customer | `{ "name": "...", "phone": "...", "password": "..." }` |
| **POST** | `/api/auth/login` | User login (Admin/Customer) | `{ "phone": "...", "password": "..." }` |
| **GET** | `/api/categories` | Get all categories | None |
| **GET** | `/api/products` | Get all products | None |
| **GET** | `/api/products/{id}` | Get product details by ID | None |
| **GET** | `/api/products/search`| Search products (filters: `query`, `categoryId` as query parameters) | None |
| **POST** | `/api/orders/calculate-delivery` | Calculate delivery charge based on address | `{ "address": "123 Market Road" }` |
| **POST** | `/api/orders/place` | Submit order (checks stock & computes distance) | `{ "customerName": "...", "phone": "...", "address": "...", "items": [{ "productId": 1, "quantity": 1.5 }] }` |
| **GET** | `/api/orders/track/{orderNumber}` | Track order progress | None |
| **GET** | `/api/settings/public` | Read shop profile and delivery fee configs | None |

### Authorized Merchant Endpoints (Requires `ADMIN` role JWT token)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| **POST** | `/api/admin/products` | Add new product | `{ "name": "...", "price": 299, "stock": 10.0, "categoryId": 1, "imageUrls": ["url1"] }` |
| **PUT** | `/api/admin/products/{id}` | Edit product details | Same as above |
| **DELETE**| `/api/admin/products/{id}` | Delete product | None |
| **POST** | `/api/admin/products/upload-image` | Upload image file to Cloudinary | `MultipartFile file`, `productName` |
| **POST** | `/api/admin/categories` | Create product category | `{ "name": "..." }` |
| **PUT** | `/api/admin/categories/{id}` | Edit category name | `{ "name": "..." }` |
| **DELETE**| `/api/admin/categories/{id}` | Delete category | None |
| **GET** | `/api/admin/orders` | View all customer orders | None |
| **PUT** | `/api/admin/orders/{id}/status` | Update order status | `{ "status": "CONFIRMED" }` |
| **GET** | `/api/admin/orders/dashboard` | Get dashboard analytic widgets | None |
| **GET** | `/api/admin/settings` | Read store settings | None |
| **PUT** | `/api/admin/settings` | Save store settings configurations | `{ "shopName": "...", "shopAddress": "...", ... }` |

---

## 5. Local Running Instructions

### A. Run Backend (Spring Boot)
Ensure Java 17+ and Maven are installed.

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The server starts on port `8080`.
On first startup, the database initializer automatically registers a default Admin account:
- **Phone:** `9999999999`
- **Password:** `admin123`

### B. Run Frontend (React + Vite + Tailwind CSS v4)
Ensure Node.js 18+ is installed.

```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`. Open this URL in your web browser.

---

## 6. Deployment Instructions

### A. Database Deployment
- Spin up a cloud-hosted MySQL database on **PlanetScale**, **Aiven**, or **Railway**.
- Obtain the database connection URI (e.g. `mysql://user:pass@host:3306/db`).
- Execute the `schema.sql` script on the remote instance.

### B. Backend Deployment (Render or Railway)
1. Commit the project repository to GitHub.
2. Link your repository to Render/Railway.
3. Configure the build command as `mvn clean package -DskipTests` and run command as `java -jar target/delivery-0.0.1-SNAPSHOT.jar` (or equivalent).
4. Define the environment variables in the portal (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `GOOGLE_MAPS_API_KEY`, etc.).

### C. Frontend Deployment (Vercel or Netlify)
1. Set the root directory of the site as `frontend`.
2. Configure the build command as `npm run build` and output directory as `dist`.
3. In production, configure environment variable `VITE_API_URL` to point to your live Render/Railway URL (e.g. `https://your-backend.onrender.com/api`).
4. To allow React Router routes to work correctly on reload, add a rewrite rule:
   - **For Netlify:** Create a `frontend/public/_redirects` file containing:
     ```
     /*    /index.html   200
     ```
   - **For Vercel:** Add a `vercel.json` file in the `frontend` folder containing:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
