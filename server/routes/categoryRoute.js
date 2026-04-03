import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addCategory, categoryList, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', upload.single("image"), authSeller, addCategory);
categoryRouter.get('/list', categoryList);
categoryRouter.put('/:id', upload.single("image"), authSeller, updateCategory);
categoryRouter.delete('/:id', authSeller, deleteCategory);

export default categoryRouter;
