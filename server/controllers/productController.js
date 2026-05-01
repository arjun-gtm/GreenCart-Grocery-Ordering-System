import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"
import Order from "../models/Order.js"

// Add Product : /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

        if (productData.stock !== undefined) {
            productData.inStock = Number(productData.stock) > 0;
        }

        await Product.create({...productData, image: imagesUrl})

        res.json({success: true, message: "Product Added"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get Product : /api/product/list?sort=price_asc|price_desc|popularity
export const productList = async (req, res)=>{
    try {
        const { sort } = req.query;
        let products = await Product.find({}).lean();

        // 1. CLEAR SORTING LOGIC
        if (sort === 'price_asc') {
            // Low to High
            products.sort((a, b) => a.offerPrice - b.offerPrice);
        } 
        else if (sort === 'price_desc') {
            // High to Low
            products.sort((a, b) => b.offerPrice - a.offerPrice);
        } 
        else if (sort === 'popularity') {
            // Popularity = Total quantity sold across all orders
            const orders = await Order.find({});
            const salesMap = {};

            orders.forEach(order => {
                order.items.forEach(item => {
                    const productId = item.product.toString();
                    salesMap[productId] = (salesMap[productId] || 0) + item.quantity;
                });
            });

            products.sort((a, b) => (salesMap[b._id.toString()] || 0) - (salesMap[a._id.toString()] || 0));
        } 
        else {
            // Default: Newest first
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({success: true, products})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res)=>{
    try {
        const { id } = req.body
        const product = await Product.findById(id)
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res)=>{
    try {
        const { id, inStock } = req.body
        const product = await Product.findById(id);
        
        if (inStock && product.stock <= 0) {
            return res.json({ success: false, message: "Cannot enable 'In Stock' for items with 0 quantity." });
        }

        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Update Product : PUT /api/product/:id
export const updateProduct = async (req, res)=>{
    try {
        const { id } = req.params
        let productData = JSON.parse(req.body.productData)

        // If new images are uploaded, upload them to Cloudinary
        let imagesUrl = []
        if (req.files && req.files.length > 0) {
            imagesUrl = await Promise.all(
                req.files.map(async (item)=>{
                    let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                    return result.secure_url
                })
            )
            productData.image = imagesUrl
        }

        if (productData.stock !== undefined) {
            productData.inStock = Number(productData.stock) > 0;
        }

        await Product.findByIdAndUpdate(id, productData)
        res.json({success: true, message: "Product Updated"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Delete Product : DELETE /api/product/:id
export const deleteProduct = async (req, res)=>{
    try {
        const { id } = req.params
        await Product.findByIdAndDelete(id)
        res.json({success: true, message: "Product Deleted"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Search Products with scoring logic: /api/product/search?q=keyword
export const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json({ success: false, message: "Query parameter is required" });
        }

        const keyword = query.toLowerCase();

        // 1. Fetch matching products (name or category)
        const products = await Product.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        }).lean();

        // 2. Apply Custom Scoring Logic
        const rankedProducts = products.map(product => {
            let score = 0;
            const name = product.name.toLowerCase();
            const category = product.category.toLowerCase();

            // Exact Name Match (Highest priority)
            if (name === keyword) {
                score += 100;
            } 
            // Name starts with keyword
            else if (name.startsWith(keyword)) {
                score += 80;
            }
            // Name contains keyword
            else if (name.includes(keyword)) {
                score += 50;
            }

            // Category match (Lower priority)
            if (category === keyword) {
                score += 30; // Exact category match
            } else if (category.includes(keyword)) {
                score += 10; // Partial category match
            }

            return { ...product, searchScore: score };
        });

        // 3. Sort by score descending
        rankedProducts.sort((a, b) => b.searchScore - a.searchScore);

        res.json({
            success: true,
            products: rankedProducts
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get Product Recommendations : GET /api/product/recommendations
export const getProductRecommendations = async (req, res) => {
    try {
        const { userId } = req.query;
        let recommendedProducts = [];
        const limitCount = req.query.limit ? parseInt(req.query.limit) : 8;
        
        if (userId) {
            // 1. Fetch user's history
            const orders = await Order.find({ userId });
            
            if (orders.length > 0) {
                // Determine frequently purchased categories
                const productIds = [];
                orders.forEach(order => {
                    order.items.forEach(item => {
                        productIds.push(item.product);
                    });
                });
                
                const purchasedProducts = await Product.find({ _id: { $in: productIds } });
                
                const categoryCounts = {};
                purchasedProducts.forEach(p => {
                    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
                });
                
                // Get top 2 categories
                const topCategories = Object.keys(categoryCounts)
                    .sort((a, b) => categoryCounts[b] - categoryCounts[a])
                    .slice(0, 2);
                
                if (topCategories.length > 0) {
                    recommendedProducts = await Product.find({
                        category: { $in: topCategories },
                        _id: { $nin: productIds } // Exclude what they already bought
                    }).limit(limitCount).lean();
                }
            }
        }
        
        // 2. Global Popularity Fallback if user history doesn't yield enough items
        if (recommendedProducts.length < limitCount) {
            const allOrders = await Order.find({});
            const salesMap = {};
            
            allOrders.forEach(order => {
                order.items.forEach(item => {
                    const id = item.product.toString();
                    salesMap[id] = (salesMap[id] || 0) + item.quantity;
                });
            });
            
            // Get IDs already recommended
            const existingIds = recommendedProducts.map(p => p._id.toString());
            
            const fallbackProducts = await Product.find({
                 _id: { $nin: existingIds }
            }).lean();
            
            // Sort by sales quantity high to low
            fallbackProducts.sort((a, b) => (salesMap[b._id.toString()] || 0) - (salesMap[a._id.toString()] || 0));
            
            const needed = limitCount - recommendedProducts.length;
            recommendedProducts = [...recommendedProducts, ...fallbackProducts.slice(0, needed)];
        }
        
        res.json({ success: true, products: recommendedProducts });
    } catch (error) {
        console.log("Recommendation Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

