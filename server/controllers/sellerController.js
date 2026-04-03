import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Login Seller : /api/seller/login

export const sellerLogin = async (req, res) =>{
    try {
        const { email, password } = req.body;

        if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
            const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

            res.cookie('sellerToken', token, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.json({ success: true, message: "Logged In" });
        }else{
            return res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get Total Users : /api/seller/users-count
export const getUsersCount = async (req, res)=>{
    try {
        const users = await User.find({}).select("-password")
        return res.json({success: true, count: users.length})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Seller isAuth : /api/seller/is-auth
export const isSellerAuth = async (req, res)=>{
    try {
        return res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Logout Seller : /api/seller/logout

export const sellerLogout = async (req, res)=>{
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get Seller Analytics : /api/seller/analytics
export const getSellerAnalytics = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        // 1. Daily Revenue & Order Count (Last 30 days)
        const dailyStats = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, isPaid: true } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$amount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Top Selling Products (Top 5)
        const topSellingProducts = await Order.aggregate([
            { $match: { isPaid: true } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalSold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $addFields: {
                    product_id: { $toObjectId: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    name: "$productDetails.name",
                    image: { $arrayElemAt: ["$productDetails.image", 0] },
                    totalSold: 1
                }
            }
        ]);

        // 3. Low Stock Products (Stock < 10 or missing)
        const lowStockProducts = await Product.find({ 
            $or: [
                { stock: { $lt: 10 } },
                { stock: { $exists: false } },
                { inStock: false }
            ]
        }).select('name stock image');

        // 4. Monthly Revenue (Current Year)
        const currentYear = today.getFullYear();
        const monthlyStats = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: new Date(`${currentYear}-01-01`) },
                    isPaid: true 
                } 
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            success: true,
            dailyStats,
            topSellingProducts,
            lowStockProducts,
            monthlyStats
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}