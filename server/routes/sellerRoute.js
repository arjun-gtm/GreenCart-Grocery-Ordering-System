import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout, getUsersCount, getSellerAnalytics } from '../controllers/sellerController.js';
import { exportOrdersPDF, exportOrdersExcel, exportProductsExcel, exportCategoriesExcel, exportFullReportPDF, exportFullReportExcel } from '../controllers/reportController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);
sellerRouter.get('/users-count', authSeller, getUsersCount);
sellerRouter.get('/analytics', authSeller, getSellerAnalytics);

// Report Routes
sellerRouter.get('/export/orders/pdf', authSeller, exportOrdersPDF);
sellerRouter.get('/export/orders/excel', authSeller, exportOrdersExcel);
sellerRouter.get('/export/products/excel', authSeller, exportProductsExcel);
sellerRouter.get('/export/categories/excel', authSeller, exportCategoriesExcel);
sellerRouter.get('/export/full/pdf', authSeller, exportFullReportPDF);
sellerRouter.get('/export/full/excel', authSeller, exportFullReportExcel);

export default sellerRouter;