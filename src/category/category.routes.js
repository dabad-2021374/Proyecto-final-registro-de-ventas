import express from "express"

import { deleteCategory, getCategories, addCategory, updateCategory, getProductsForCategory, searchProductsForCategory, searchCategByCoinci } from "./category.controller.js";
import {validateJwt, isAdmin, isClient} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.post('/addCategory', [validateJwt, isAdmin], addCategory)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)
api.get('/getCategories', [validateJwt], getCategories)
api.get('/getProductsForCategory/:id', getProductsForCategory)
api.post('/searProdForCate', searchProductsForCategory)
api.post('/searchCategByCoinci', searchCategByCoinci)

export default api