# GreenCart Algorithms Documentation

This document provides an in-depth technical overview of the various custom algorithms implemented within the GreenCart grocery e-commerce platform. The project utilizes localized ranking algorithms for product recommendations, intelligent searching, and dynamic sorting to enhance user experience and product discoverability without relying on external search AI services.

## 1. Product Search & Relevance Ranking Algorithm

The search system is designed to go beyond simple partial text matching. It implements a multi-tier relevance scoring algorithm to ensure users find precisely what they are looking for, automatically sorting the most relevant items first.

**Location**: `server/controllers/productController.js` -> `searchProducts`

### Execution Flow:
1.  **Initial DB Retrieval**: A broad MongoDB lookup is performed using `$regex` to fetch products where the search query partially matches either the product `name` or `category` (case-insensitive).
2.  **Custom Scoring Logic**: Each mapped product undergoes a rigorous scoring evaluation based on the strength of the text match:
    *   **+100 Points (Highest Priority)**: Exact matching with the Product's Title/Name.
    *   **+80 Points**: Product Name begins precisely with the search keyword.
    *   **+50 Points**: Product Name contains the keyword anywhere within the string.
    *   **+30 Points**: Exact match with the Product's Category name.
    *   **+10 Points (Lowest Priority)**: Product Category partially contains the keyword.
3.  **Result Sorting**: After mapping cumulative scores across the payload, the array is locally sorted by their overall `searchScore` in descending order, guaranteeing the most precise intent matches are rendered first.

---

## 2. Dynamic Recommendation Engine

GreenCart utilizes a hybrid recommendation algorithm merging user-specific personalization (derived from purchase history) with a global popularity fallback module. This ensures shoppers receive relevant suggestions regardless of their account age.

**Location**: `server/controllers/productController.js` -> `getProductRecommendations`

### Recommendation Pipeline:

#### Phase A: History-Based Personalization
If a user is logged in and possesses prior order history, the engine curates a bespoke payload based on their habits:
1.  **Order Extraction**: Parses all confirmed past orders tied to the `userId`.
2.  **Category Frequency Mapping**: Iterates through every purchased item, accumulating a hash map to calculate the aggregate frequency of interacted categories.
3.  **Top Interest Isolation**: Sorts the hash map to single out the top 2 preferred product categories the user purchases.
4.  **Novelty Selection**: Locates inventory residing within these top 2 categories while actively using MongoDB `$nin` to **exclude** items the user has already bought. This maximizes discovering new, yet aligned, inventory.

#### Phase B: Global Popularity Fallback
If the user lacks history, or Phase A yields insufficient items (under the 8-item cap limit), the engine aggregates global shopper behavior:
1.  **Global Sales Aggregation**: Scans all completed orders across the platform.
2.  **Frequency Map Generation**: Compiles a real-time `salesMap` detailing total volumetric quantities sold globally per product ID.
3.  **Deduplication**: Excludes entity IDs already recommended during Phase A.
4.  **Trending Sort**: Ranks the remaining database catalog using the `salesMap` data (highest volume to lowest).
5.  **Fulfillment**: Slices the top globally moving items to append to the payload until the exact recommendation limit is fulfilled.

---

## 3. Real-Time Sorting Algorithms

The catalog provides multiple avenues for arranging inventory, executed via real-time array evaluations post-retrieval.

**Location**: `server/controllers/productController.js` -> `productList`

### Sorting Implementations:
*   **Price (Low to High)**: Executes an automated numerical comparison ranking `offerPrice` (`a - b`).
*   **Price (High to Low)**: Reversed numerical comparison ranking `offerPrice` (`b - a`).
*   **Popularity Ranking**:
    *   Bypasses simple static db fields relying on live order calculations.
    *   It fetches all order items across the database dynamically.
    *   A custom Javascript Array `.sort()` function executes where products check their IDs against the calculated global `salesMap`. 
    *   This forces the absolute highest-selling items across the entire app ecosystem to rise to the top of standard product lists.
*   **Default Chronological**: If no sort flag is provided, a standard Javascript date comparative sort triggers utilizing the `createdAt` property, ensuring fresh product drops natively appear first.
