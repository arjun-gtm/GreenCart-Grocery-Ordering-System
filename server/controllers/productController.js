import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"

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

// Get Product : /api/product/list
export const productList = async (req, res)=>{
    try {
        const products = await Product.find({}).sort({ createdAt: -1 })
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
