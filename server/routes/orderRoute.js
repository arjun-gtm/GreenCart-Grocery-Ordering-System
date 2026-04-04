import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderOnline, deleteOrder, updateOrderStatus, updateOrderPayment } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/online', authUser, placeOrderOnline)
orderRouter.patch('/:id/status', authSeller, updateOrderStatus)
orderRouter.patch('/:id/payment', authSeller, updateOrderPayment)
orderRouter.delete('/:id', authSeller, deleteOrder)

export default orderRouter;