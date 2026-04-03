import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    items: [{
        product: {type: String, required: true, ref: 'product'},
        quantity: {type: Number, required: true}
    }],
    amount: {type: Number, required: true},
    address: {type: String, required: true, ref: 'address'},
    status: {type: String, default: 'Processing'},
    paymentType: {type: String, required: true},
    isPaid: {type: Boolean, required: true, default: false},
},{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

orderSchema.virtual('user', {
    ref: 'user',
    localField: 'userId',
    foreignField: 'clerkId',
    justOne: true
})

const Order = mongoose.models.order || mongoose.model('order', orderSchema)

export default Order