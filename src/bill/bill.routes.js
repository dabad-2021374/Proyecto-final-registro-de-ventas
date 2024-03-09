'use strict'

import { Router } from 'express'
import { getBillsByUser, printBill, updateBill } from '../bill/bill.controller.js'
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'

const api = Router()

api.put('/updateBill/:id', [validateJwt, isAdmin], updateBill)
api.get('/printBill/:id', [validateJwt], printBill)
api.post('/history', [validateJwt], getBillsByUser)

export default api