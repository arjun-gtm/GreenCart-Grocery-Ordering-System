import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String, unique: true },
    cartItems: { type: Object, default: {} },
}, { minimize: false })

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User