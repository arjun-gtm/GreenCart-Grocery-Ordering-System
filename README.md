# GreenCart - Full Stack Grocery E-Commerce

GreenCart is a premium, high-performance grocery e-commerce solution built with the MERN stack. It features a sophisticated administrative dashboard for sellers and a seamless shopping experience for customers, complete with secure payments and real-time inventory management.

## 🚀 Key Features

### 🛒 Customer Experience
- **Dynamic Marketplace**: Browse products by categories with real-time stock status.
- **Persistent Cart**: Shopping cart synchronized with MongoDB, ensuring items are saved across sessions.
- **Smart Search**: Quickly find products using the integrated search system.
- **Secure Authentication**: JWT-based login/signup with secure, HTTP-only cookie storage.
- **Order Management**: Track order history, fulfillment status, and payment details.
- **Address Book**: Manage multiple delivery addresses for a faster checkout.

### 💳 Payment & Checkout
- **Stripe Integration**: Secure online payments via Stripe Checkout and Webhooks for automated order confirmation.
- **Cash on Delivery (COD)**: Flexible payment options for customers.
- **Tax Calculation**: Automated 2% tax calculation on every order.

### 👨‍💼 Seller / Admin Dashboard
- **Analytics Overview**:
    - **Revenue Tracking**: Differentiates between "Confirmed Revenue" (Paid) and "On Hold" (Unpaid COD).
    - **Order Statistics**: Total orders, total customers, and total products.
    - **Customer Metrics**: Total count of registered customers.
    - **Recent Activity**: Live feed of the latest 5 orders with actual product images.
- **Inventory Management**:
    - Add, edit, and delete products with multi-image support.
    - Real-time stock toggle (In Stock / Out of Stock).
- **Category Management**: Create and organize custom categories with color-coded backgrounds and images.
- **Order Fulfillment**: Update shipment status (Processing, Out for Delivery, Delivered, Cancelled).
- **COD Payment Management**: Sellers can manually mark COD orders as "Paid" once the cash is collected.

## 🛠️ Technology Stack

### Frontend
- **React 19**
- **Vite** (Build Tool)
- **Tailwind CSS v4** (Styling)
- **React Context API** (State Management)
- **React Router 7** (Navigation)
- **Axios** (API Requests)
- **React Hot Toast** (Notifications)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose** (Database)
- **JSON Web Tokens (JWT)** (Secure Auth)
- **Cloudinary** (Image Hosting)
- **Multer** (File Upload Handling)
- **Stripe API** (Payment Processing)
- **BcryptJS** (Password Hashing)

## 📂 Project Structure

```text
greencart/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (AppContext)
│   │   ├── pages/          # View components
│   │   │   └── seller/     # Admin Dashboard pages
│   │   └── assets/         # Static assets & icons
├── server/                 # Express Backend
│   ├── configs/            # Database & Cloudinary config
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   └── middlewares/        # Auth & validation
└── README.md               # Main Documentation
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB URI
- Cloudinary Credentials
- Stripe API Keys

### 1. Backend Setup
1. Navigate to the `server` folder.
2. Create a `.env` file and add the following:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   SELLER_EMAIL=admin@greencart.com
   SELLER_PASSWORD=your_dashboard_password
   ```
3. Install dependencies: `npm install`
4. Start the server: `npm run server`

### 2. Frontend Setup
1. Navigate to the `client` folder.
2. Create a `.env` file:
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   VITE_CURRENCY=$
   ```
3. Install dependencies: `npm install`
4. Start the app: `npm run dev`

## 🛡️ Security Features
- **HTTP-Only Cookies**: JWT tokens are stored in secure cookies, preventing XSS-based token theft.
- **Protected Routes**: Middleware verifies authentication status before allowing access to administrative or user-specific data.
- **CORS Configuration**: Restricts API calls to authorized origins only.

---
Created by Antigravity AI - Empowering modern web applications.
