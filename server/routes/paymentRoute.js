import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../controllers/paymentController.js';
import authUser from '../middlewares/authUser.js';

const paymentRouter = express.Router();

paymentRouter.post('/khalti-initiate', authUser, initiateKhaltiPayment);
paymentRouter.post('/khalti-verify', verifyKhaltiPayment);

export default paymentRouter;
