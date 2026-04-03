import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    path: { type: String, required: true, unique: true },
    bgColor: { type: String, required: true },
    image: { type: String, required: true },
}, { timestamps: true })

const Category = mongoose.models.category || mongoose.model('category', categorySchema)

export default Category
