import express from "express"

import { addProduct, deleteProduct, getProducts, searchProduct, soldOutProducts, updateProduct } from "./product.controller.js";
import { isAdmin, validateJwt } from "../middlewares/validate-jwt.js";

const api = express.Router();

api.post('/addProduct', [validateJwt, isAdmin], addProduct)
api.get('/getProducts', [validateJwt], getProducts)
api.post('/searchProduct', [validateJwt], searchProduct)
api.put('/updateProduct/:id', [validateJwt, isAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateJwt, isAdmin], deleteProduct)
api.get('/soldOutProducts', [validateJwt], soldOutProducts)

export default api