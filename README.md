# GreenCart - Full Stack Grocery E-Commerce

GreenCart is a premium, high-performance grocery e-commerce solution built with the MERN stack. It features a sophisticated administrative dashboard for sellers, advanced product search capabilities, and a seamless shopping experience for customers. It handles modern capabilities like Clerk authentication, Khalti automated payments, and dynamic business analytics reporting.

## 🚀 Key Features

### 🛒 Customer Experience
- **Secure Authentication**: Completely modernized and secure user authentication powered by **Clerk** (with synchronous user data tracking mapped to MongoDB).
- **Advanced Search & Discovery**: 
  - **Ranked Keyword Search**: Highly relevant product lookup based on exact and partial matches.
  - **Dynamic Sorting**: Filter results by Price (low/high) or Popularity (most ordered).
  - **Smart Recommendations**: A personalized product recommendation engine analyzing your past order history combined with global trending metrics.
- **Dynamic Marketplace**: Browse products by categorizations with real-time stock/inventory status.
- **Persistent Cart**: Shopping cart synchronized with MongoDB, ensuring items are saved across sessions.
- **Order Management**: Track order history, fulfillment status, and payment tracking.
- **Address Book**: Manage multiple delivery addresses for a faster checkout.

### 💳 Payment & Checkout
- **Khalti E-Payment (v2)**: Secure, frictionless online transactions integrated using Khalti's server-to-server epayment lookup architecture.
- **Cash on Delivery (COD)**: Flexible offline payment options.
- **Automated Calculations**: Dynamic cart sums with automated 2% tax calculation and free shipping thresholds.

### 👨‍💼 Seller / Admin Dashboard
- **Analytics Overview**:
    - **Advanced Reporting**: Instantly export full dashboard sales reports to high-quality **PDF** documents or **Excel** spreadsheets!
    - **Revenue Tracking**: Differentiates between "Confirmed Revenue" (Paid) and "On Hold" (Unpaid COD).
    - **Order Statistics**: Monitor total orders, distinct customers, and top-moving products.
    - **Recent Activity**: Live feed of the latest orders rendering actual product images and live stock updates.
- **Inventory Management**:
    - Add, Edit, and Delete products with multi-image Cloudinary uploads.
    - Real-time stock toggle functionality.
- **Category Management**: Create and organize custom categories with color-coded backgrounds and unique images.
- **Order Fulfillment**: Update shipment logistics (Processing, Out for Delivery, Delivered, Cancelled).
- **COD Payment Management**: Sellers can manually mark completed Cash on Delivery orders as "Paid."

## 🛠️ Technology Stack

### Frontend
- **React 19**
- **Vite** (Build Tool)
- **Tailwind CSS v4** (Styling & Responsive UI)
- **Clerk** (User Session state management)
- **React Context API** (Application State Management)
- **React Router 7** (Page Navigation)
- **Axios** (API Requests)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose** (Database)
- **Clerk SDK & Webhooks** (Authentication Synchronization)
- **Khalti Gateway** (Payment Processing)
- **Cloudinary** (Image Hosting)
- **Multer** (File Upload Handling)

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
│   └── middlewares/        # Auth & validation workflows
└── README.md               # Main Documentation
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB URI
- Cloudinary Credentials
- Clerk Publishable / Secret Keys
- Khalti API Keys

### 1. Backend Setup
1. Navigate to the `server` folder.
2. Create a `.env` file and add the following:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   KHALTI_PUBLIC_KEY=your_khalti_public_key
   KHALTI_SECRET_KEY=your_khalti_secret_key
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
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```
3. Install dependencies: `npm install`
4. Start the app: `npm run dev`

## 🛡️ Security Features
- **API Protection**: Backend middleware verifies Clerk JWT authentication tokens before modifying any administrative or user-specific data.
- **Server-to-Server Payments**: Khalti payments enforce direct backend-to-backend signature validation, avoiding manipulation on the client-side.
- **Idempotency Execution**: Prevents double-charging or erroneous dual inventory execution on server restarts.

---
Created Arjun Gautam.
