'use strict'

import { Router } from 'express'
import { printBill, updateBill } from '../bill/bill.controller.js'
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'

const api = Router()

api.put('/updateBill/:id', [validateJwt, isAdmin], updateBill)
api.get('/printBill/:id', printBill)

export default api