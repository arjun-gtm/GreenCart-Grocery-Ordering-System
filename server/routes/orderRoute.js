import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, deleteOrder, updateOrderStatus, updateOrderPayment } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.patch('/:id/status', authSeller, updateOrderStatus)
orderRouter.patch('/:id/payment', authSeller, updateOrderPayment)
orderRouter.delete('/:id', authSeller, deleteOrder)

export default orderRouter;