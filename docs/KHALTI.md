# Khalti Integration — Greencart

This document explains how Khalti (Nepal payment gateway) is integrated into the Greencart Grocery Ordering System repository (client + server). It covers the end-to-end flow from the moment a user clicks "Pay" to backend verification, what data is exchanged, relevant files to inspect, and recommended improvements.

---

## Overview

- Payments are handled server-side with Khalti's ePayment API. The server keeps the Khalti secret key and uses it to initiate and verify payments.
- Frontend creates an order (isPaid: false) and then asks the server to initiate a Khalti payment session. The server returns a Khalti-hosted `payment_url` and the client redirects the user to it.
- Khalti redirects back to the frontend `return_url` with a query parameter `pidx`. The frontend then asks the server to verify the `pidx`. The server calls Khalti's lookup API and marks the order as paid when status is `Completed`.

---

## Where to find the code

- Client (begin flow & redirect): `client/src/pages/Cart.jsx`
- Client (return/verify): `client/src/pages/PaymentSuccess.jsx`
- Server routes: `server/routes/paymentRoute.js`
- Server payment logic (initiate & verify): `server/controllers/paymentController.js`
- Order creation (online payments): `server/controllers/orderController.js`

---

## Required environment variables

- KHALTI_SECRET_KEY (server)
- KHALTI_PUBLIC_KEY (optional; current flow does not require exposing it)
- FRONTEND_URL (used by server to build `return_url` — default: `http://localhost:5173`)

These are also referenced in the project's README.

---

## End-to-end flow (detailed)

1. User clicks "Pay" on the cart page and selects "Online".

2. Frontend: create order for online payment

- Endpoint: POST `/api/order/online`
- Payload example:

```json
{
  "userId": "<clerkUserId>",
  "items": [{ "product": "<productId>", "quantity": 2 }],
  "address": "<addressId>"
}
```

- Server (orderController.placeOrderOnline): validates products, computes `amount`, adds tax, creates an Order document with `isPaid: false`. Returns `{ success: true, orderId }`.

3. Frontend stores orderId and asks server to initiate Khalti

- Frontend saves the `orderId` in `sessionStorage` under `currentOrderId`.
- Frontend calls POST `/api/payment/khalti-initiate` with `{ orderId }`.
- Note: the `/khalti-initiate` route is protected by `authUser` middleware.

4. Server initiates Khalti payment session

- Controller: `initiateKhaltiPayment` in `server/controllers/paymentController.js`.
- Server builds payload (amount must be in paisa / smallest currency unit):

```json
{
  "return_url": "<FRONTEND_URL>/payment-success",
  "website_url": "<FRONTEND_URL>",
  "amount": <amount_in_paisa>,
  "purchase_order_id": "<order._id>",
  "purchase_order_name": "Greencart Order",
  "customer_info": { "name": "...", "email": "...", "phone": "..." }
}
```

- Server POSTs to `https://a.khalti.com/api/v2/epayment/initiate/` with header `Authorization: Key <KHALTI_SECRET_KEY>`.
- Successful response contains `payment_url`. Server responds to client with `{ success: true, paymentUrl }`.

5. Client redirects user to `paymentUrl`

- The user completes the payment on Khalti's hosted page.

6. Khalti redirects user back to the frontend `return_url`

- Return URL used: `<FRONTEND_URL>/payment-success`.
- Khalti includes a query parameter `pidx` on this redirect URL. Example: `/payment-success?pidx=pidx_abcdef123`

7. Frontend verifies payment by calling server

- Page component: `client/src/pages/PaymentSuccess.jsx`.
- On mount, it reads `pidx` from URL (`new URLSearchParams(window.location.search).get('pidx')`) and `orderId` from `sessionStorage.currentOrderId`.
- If both exist, it POSTs to `/api/payment/khalti-verify` with body `{ pidx, orderId }`.

8. Server verifies with Khalti lookup

- Endpoint: `verifyKhaltiPayment` in `server/controllers/paymentController.js`.
- Server calls `https://a.khalti.com/api/v2/epayment/lookup/` with `{ pidx }` and `Authorization: Key <KHALTI_SECRET_KEY>` header.
- The controller checks `data.status === "Completed"`.
  - If completed: mark order as paid (`isPaid: true`, `refId: pidx`) and clear user's server-side cart.
  - If not: return error and frontend redirects to payment-failure.

---

## Data exchanged / payload examples

- Client -> /api/order/online

```json
{ "userId": "clerkUserId", "items": [{ "product": "641...", "quantity": 2 }], "address": "<addressId>" }
```

- Server -> Khalti (initiate)

```json
{
  "return_url": "http://localhost:5173/payment-success",
  "website_url": "http://localhost:5173",
  "amount": 12500,
  "purchase_order_id": "64a...",
  "purchase_order_name": "Greencart Order",
  "customer_info": { "name": "Arjun Gautam", "email": "user@example.com", "phone": "9800000000" }
}
```

- Khalti initiate response (important field):

```json
{ "payment_url": "https://khalti.com/.../pay?token=..." }
```

- Client -> /api/payment/khalti-verify

```json
{ "pidx": "pidx_abcdef123", "orderId": "64a..." }
```

- Server -> Khalti (lookup)

```json
{ "pidx": "pidx_abcdef123" }
```

- Khalti lookup response (server checks):

```json
{ "status": "Completed", /* plus other fields */ }
```

---

## Important code snippets (where to look)

- Client creates order + initiates Khalti (redirect):
  - `client/src/pages/Cart.jsx` — look for `POST /api/order/online` and then `POST /api/payment/khalti-initiate` and `window.location.href = khaltiRes.data.paymentUrl`.

- Client verifies payment on redirect:
  - `client/src/pages/PaymentSuccess.jsx` — reads `pidx`, reads `currentOrderId` from sessionStorage, and POSTs `/api/payment/khalti-verify`.

- Server routes:
  - `server/routes/paymentRoute.js` — registers `/khalti-initiate` and `/khalti-verify`.

- Server initiate & verify logic:
  - `server/controllers/paymentController.js` — builds payload for initiate, calls Khalti initiate & lookup, marks order paid.

- Order creation:
  - `server/controllers/orderController.js` — `placeOrderOnline` creates the Order document and returns `orderId`.

---

## Security & correctness notes

- Secret key safety: Khalti secret key is kept server-side and used for server-to-server calls (`Authorization: Key <KHALTI_SECRET_KEY>`). The secret is not exposed to the browser in the current flow.
- Authentication:
  - `/khalti-initiate` is protected by `authUser` middleware (ensures only authenticated users can initiate payments).
  - `/khalti-verify` is NOT protected in routes; consider requiring auth or verifying the requester owns the order.
- Additional validation recommended:
  - Verify the `amount` and `purchase_order_id` returned by Khalti in `lookup` response match the server-side Order before marking it paid.
  - Store raw Khalti response JSON and transaction metadata on a `Payment` or `Order.payment` field for auditing.
  - Ensure idempotent handling of `khalti-verify` so repeated calls don't cause inconsistent states.

---

## Troubleshooting

- "Server misconfiguration: KHALTI_SECRET_KEY is missing"
  - Ensure `KHALTI_SECRET_KEY` is set in the server `.env`.

- Khalti initiate returns error / non-OK
  - Check server logs (controller prints `console.error` with response body). Confirm `Authorization` header, `amount` format (paisa), and payload fields.

- PaymentSuccess not verifying / redirects to failure
  - Ensure `sessionStorage.currentOrderId` exists. If user cleared session storage or used a different device, client cannot verify automatically.

- Verify returns non-Completed status
  - Inspect Khalti lookup response for details (`data.status`, amount, purchase_order_id). Use logs to diagnose mismatch.

---

## Suggested improvements (optional tasks)

1. Validate `amount` and `purchase_order_id` from the Khalti lookup response against the server Order before marking paid.
2. Persist the full Khalti response JSON (transaction id, raw payload, timestamps) to an Order.payment or Payments collection for audit and troubleshooting.
3. Add auth/ownership validation to `/api/payment/khalti-verify` so only the order owner can request verification.
4. Support webhook-based server-side verification (if Khalti supports webhooks) so the server can be notified directly without relying solely on client redirect.
5. Add idempotency keys and guard rails to prevent duplicate processing for the same `pidx`.

---

## Final notes

This repository already implements a working server-side Khalti integration. The main immediate improvements are stronger verification checks and storing transaction metadata. If you'd like, I can:

- Commit this file to `docs/KHALTI.md` (done in this change), or
- Implement the suggested code changes (e.g., amount verification, persistence), and open a PR.

