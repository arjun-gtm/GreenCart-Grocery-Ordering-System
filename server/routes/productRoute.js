import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList, updateProduct, deleteProduct, searchProducts, getProductRecommendations } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);
productRouter.get('/list', productList)
productRouter.get('/search', searchProducts)
productRouter.get('/recommendations', getProductRecommendations)
productRouter.get('/id', productById)
productRouter.post('/stock', authSeller, changeStock)
productRouter.put('/:id', upload.array(["images"]), authSeller, updateProduct);
productRouter.delete('/:id', authSeller, deleteProduct);

export default productRouter;