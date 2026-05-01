import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderOnline, deleteOrder, updateOrderStatus, updateOrderPayment, cancelOrder } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.post('/online', authUser, placeOrderOnline)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.patch('/:id/status', authSeller, updateOrderStatus)
orderRouter.patch('/:id/payment', authSeller, updateOrderPayment)
orderRouter.patch('/:id/cancel', authUser, cancelOrder)
orderRouter.delete('/:id', authSeller, deleteOrder)

export default orderRouter;