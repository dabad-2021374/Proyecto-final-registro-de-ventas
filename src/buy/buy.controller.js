'use strict'

import Buy from './buy.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'

//variable global
const userCarts = {}

export const handleCart = async (req, res) => {
    try {
        //inicializar el carrito
        userCarts[req.user._id] = userCarts[req.user._id] || []

        let { productId, quantity, confirm } = req.body

        //si se confirma la compra
        if (confirm === 'confirm') {
            // si carrito esta vacio
            if (userCarts[req.user._id].length === 0) return res.status(400).send({ message: 'Cart is empty' })

            // Calcular el total de la compra
            let total = 0
            for (let item of userCarts[req.user._id]) {
                let productData = await Product.findById(item.product)
                if (productData) {
                    total += productData.price * item.quantity
                }
            }

            //Actualizar el stock y el registro de productos vendidos
            for (let item of userCarts[req.user._id]) {
                let productData = await Product.findById(item.product)
                if (productData) {
                    //si sobrepasa el stock no dejar comprar
                    if (item.quantity > productData.stock) {
                        if (item.quantity !== productData.stock) {
                            return res.status(400).send({ message: `Not enough stock for product ${productData.name} existing: ${productData.stock}` });
                        }
                    }
                    productData.stock -= item.quantity
                    productData.sold = Number(productData.sold) + Number(item.quantity)
                    await productData.save()
                }
            }

            let buy = new Buy({
                user: req.user._id,
                products: userCarts[req.user._id],
                total: total,
                date: new Date()
            })

            let savedBuy = await buy.save()

            let bill = new Bill({
                user: req.user._id,
                products: savedBuy.products,
                total: total,
                buy: savedBuy._id,
                date: new Date()
            })

            await bill.save()

            // letruir mensaje de respuesta con los productos agregados
            let responseMessage = {
                message: 'Buy confirmed',
                products: savedBuy.products.map(item => ({
                    productId: item.product,
                    quantity: item.quantity
                }))
            }

            // Limpiar el carrito del usuario
            userCarts[req.user._id] = []

            //------------------------------------------------------------Crear el PDF de la factura
            let doc = new PDFDocument()

            //nombre del archivo
            let fileName = `bill_${new Date().getTime()}.pdf`

            //contenido del pdf
            doc
                .fontSize(20)
                .text('Factura', { align: 'center' })
                .moveDown()

            doc
                .fontSize(12)
                .text(`Tipo de Factura: ${bill.typeBill}`, { align: 'center' })
                .text(`Fecha de Emision: ${new Date().toLocaleDateString()}`, { align: 'center' })
                .text(`Username: ${req.user.username}`, { align: 'center' })
                .text(`idUsuario: ${req.user._id}`, { align: 'center' })
                .text(`idFactura: ${bill._id}`, { align: 'center' })


                .moveDown()

            let totalCompra = 0

            for (let item of savedBuy.products) {
                let product = await Product.findById(item.product).exec()
                if (product) {
                    let subtotal = product.price * item.quantity //calcular el subtotal
                    totalCompra += subtotal //Agregar el subtotal al total de la compra

                    doc.text(`${product.name} ------- (${item.quantity} x Q.${product.price}) ---------> ${subtotal}`)
                    doc.moveDown()
                }
            }

            doc.moveDown()
            doc.fontSize(14).text(`Total de la compra: ${totalCompra}`, { align: 'right' })

            //guarda el pdf en la ruta raiz
            doc.pipe(fs.createWriteStream(`${fileName}`))
            doc.end()

            return res.send({ message: 'Buy confirmed', pdfPath: fileName, responseMessage })
        } else {
            // si no la cantidad es valida
            if (isNaN(quantity) || quantity <= 0) {
                return res.status(404).send({ message: 'Invalid quantity' })
            }

            // Verificar si el producto existe en la base de datos
            let product = await Product.findById(productId)
            if (!product) {
                return res.status(404).send({ message: 'Product not found' })
            }

            // Agregar el producto al carrito del usuario
            userCarts[req.user._id].push({ product: product._id, quantity })

            // letruir mensaje de respuesta con los productos en el carrito
            let responseMessage = {
                message: 'Product added to cart',
                cart: userCarts[req.user._id]
            }

            return res.send(responseMessage)
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error saving buy' })
    }
}
