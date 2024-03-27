import { Router } from "express";
import { matrixAdd, matrixProduct } from '../controllers/matrix.controller.js';

const router = Router();

router.post('/add', matrixAdd);
router.post('/product', matrixProduct);

export default router;