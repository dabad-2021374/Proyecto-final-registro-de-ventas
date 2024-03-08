import express from "express"

import { handleCart } from "./buy.controller.js"
import { isAdmin, validateJwt } from "../middlewares/validate-jwt.js"

const api = express.Router()

api.post('/handleCart', [validateJwt], handleCart)

export default api