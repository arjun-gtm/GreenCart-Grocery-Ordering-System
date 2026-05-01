import express from 'express';
import { isAuth, userData } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.get('/data', authUser, userData)
userRouter.get('/is-auth', authUser, isAuth)

export default userRouter