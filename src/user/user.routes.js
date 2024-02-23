import express from 'express'
import { testU, registerU, login, updateU, deleteU, registerA } from './user.controller.js';
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router();

api.post('/registerU', registerU)
api.post('/registerA', [validateJwt, isAdmin], registerA)
api.post('/login', login)
api.get('/testU', [validateJwt, isAdmin], testU)
api.put('/updateU/:id', [validateJwt], updateU)
api.delete('/deleteU/:id', [validateJwt], deleteU)

export default api