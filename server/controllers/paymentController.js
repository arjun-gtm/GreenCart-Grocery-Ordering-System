import Order from '../models/Order.js';
import User from '../models/User.js';

export const initiateKhaltiPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }

        const order = await Order.findById(orderId).populate('user');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const amount_in_paisa = Math.round(order.amount * 100);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

        if (!khaltiSecretKey) {
            return res.status(500).json({ success: false, message: "Server misconfiguration: KHALTI_SECRET_KEY is missing" });
        }

        const payload = {
            return_url: `${frontendUrl}/payment-success`,
            website_url: frontendUrl,
            amount: amount_in_paisa,
            purchase_order_id: order._id.toString(),
            purchase_order_name: "Greencart Order",
            customer_info: {
                name: order.user ? `${order.user.firstName || 'User'} ${order.user.lastName || ''}`.trim() : "Customer",
                email: order.user ? order.user.email : "user@example.com",
                phone: order.user ? (order.user.phone || "9800000000") : "9800000000"
            }
        };

        const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${khaltiSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Khalti initiate error:", data);
            return res.status(response.status).json({ success: false, message: data.detail || "Khalti initialization failed" });
        }

        return res.json({
            success: true,
            paymentUrl: data.payment_url
        });
    } catch (error) {
        console.error("Khalti initiate error context:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx, orderId } = req.body;
        if (!pidx || !orderId) {
            return res.status(400).json({ success: false, message: "pidx and orderId are required" });
        }

        const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
        if (!khaltiSecretKey) {
            return res.status(500).json({ success: false, message: "Server misconfiguration: KHALTI_SECRET_KEY is missing" });
        }

        const response = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${khaltiSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pidx })
        });

        const data = await response.json();

        if (response.ok && data.status === "Completed") {
            const order = await Order.findByIdAndUpdate(orderId, { 
                isPaid: true, 
                refId: pidx 
            });

            if (order) {
                await User.findOneAndUpdate({ clerkId: order.userId }, { cartItems: {} });
            }
            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            console.error("Khalti verify bad status:", data);
            return res.status(400).json({ success: false, message: `Payment validation error. Status: ${data.status || 'unknown'}` });
        }
    } catch (error) {
        console.error("Khalti verify exception:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
