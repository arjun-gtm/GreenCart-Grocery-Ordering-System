import { v2 as cloudinary } from "cloudinary"
import Category from "../models/Category.js"

// Add Category : /api/category/add
export const addCategory = async (req, res) => {
    try {
        const { name, path, bgColor } = req.body

        if (!name || !path || !bgColor || !req.file) {
            return res.json({ success: false, message: "All fields are required" })
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ path: path.toLowerCase() })
        if (existingCategory) {
            return res.json({ success: false, message: "Category path already exists" })
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
        const imageUrl = result.secure_url

        await Category.create({
            name,
            path: path.toLowerCase(),
            bgColor,
            image: imageUrl
        })

        res.json({ success: true, message: "Category Added Successfully" })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Get All Categories : /api/category/list
export const categoryList = async (req, res) => {
    try {
        const categories = await Category.find({})
        res.json({ success: true, categories })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Update Category : PUT /api/category/:id
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, path, bgColor } = req.body

        if (!name || !path || !bgColor) {
            return res.json({ success: false, message: "All fields are required" })
        }

        let updateData = {
            name,
            path: path.toLowerCase(),
            bgColor
        }

        // If new image is uploaded, upload it to Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
            updateData.image = result.secure_url
        }

        await Category.findByIdAndUpdate(id, updateData)
        res.json({ success: true, message: "Category Updated Successfully" })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Delete Category : /api/category/:id
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        await Category.findByIdAndDelete(id)
        res.json({ success: true, message: "Category Deleted" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
