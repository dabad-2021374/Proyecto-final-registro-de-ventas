import express from "express"

import { deleteCategory, getCategories, addCategory, updateCategory, getProductsForCategory } from "./category.controller.js";
import {validateJwt, isAdmin, isClient} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.post('/addCategory', [validateJwt, isAdmin], addCategory)
api.get('/getCategories', [validateJwt], getCategories)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)
api.get('/getProductsForCategory/:id', getProductsForCategory)

export default api