import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js"

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }
            if (!product.inStock) {
                return res.json({ success: false, message: `"${product.name}" is out of stock` });
            }
        }
        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({success: true, message: "Order Placed Successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Place Order Online (Khalti) : /api/order/online
export const placeOrderOnline = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }
            if (!product.inStock) {
                return res.json({ success: false, message: `"${product.name}" is out of stock` });
            }
        }

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            isPaid: false
        });

        return res.json({ success: true, message: "Order created for payment", orderId: order._id });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const userId = req.userId || req.body.userId;
        console.log("Fetching orders for User ID:", userId);
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address user").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address user").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete order (seller) : DELETE /api/order/:id
export const deleteOrder = async (req, res)=>{
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        return res.json({ success: true, message: "Order deleted" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Cancel order (user) : PATCH /api/order/:id/cancel
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const order = await Order.findOne({
            _id: id,
            userId,
        });

        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        const currentStatus = order.status?.toLowerCase();
        if (currentStatus === 'delivered') {
            return res.json({ success: false, message: 'Delivered orders cannot be cancelled' });
        }
        if (currentStatus === 'cancelled' || currentStatus === 'canceled') {
            return res.json({ success: false, message: 'Order is already cancelled' });
        }

        order.status = 'Cancelled';
        await order.save();

        return res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

const ORDER_STATUSES = [
    "Processing",
    "Out for delivery",
    "Delivered",
    "Cancelled",
];

// Update COD payment status (seller) : PATCH /api/order/:id/payment
export const updateOrderPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPaid } = req.body;
        if (typeof isPaid !== 'boolean') {
            return res.json({ success: false, message: 'isPaid must be a boolean' });
        }
        const order = await Order.findById(id);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }
        if (order.paymentType !== 'COD') {
            return res.json({ success: false, message: 'Payment status can only be changed for COD orders' });
        }
        await Order.findByIdAndUpdate(id, { isPaid });
        return res.json({ success: true, message: `Payment marked as ${isPaid ? 'Paid' : 'Unpaid'}` });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Update order fulfillment status (seller) : PATCH /api/order/:id/status
export const updateOrderStatus = async (req, res)=>{
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !ORDER_STATUSES.includes(status)) {
            return res.json({ success: false, message: "Invalid status" });
        }
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        return res.json({ success: true, message: "Status updated", order });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}