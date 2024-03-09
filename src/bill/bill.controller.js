'use strict'

import Bill from './bill.model.js'
import Buy from '../buy/buy.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'

export const updateBill = async (req, res) => {
    try {
        let { id } = req.params
        let { productId, newQuantity } = req.body

        let bill = await Bill.findById(id)
        if (!bill) return res.status(404).send({ message: 'Bill not found' })

        // Encontrar el producto dentro de la factura
        let productIndex = bill.products.findIndex(item => item.product.toString() === productId)
        if (productIndex === -1) return res.status(404).send({ message: 'Product not found in bill' })

        // Obtener el producto
        let product = bill.products[productIndex]

        //guardar cantidad antigua para calcular la diferencia
        let oldQuantity = product.quantity

        //actualizar la cantidad del producto en la factura
        product.quantity = newQuantity

        //diferencia en la cantidad
        let quantityDifference = newQuantity - oldQuantity

        // Buscar el precio actualizado del producto en la base de datos
        let productData = await Product.findById(product.product)
        if (!productData) {
            return res.status(404).send({ message: 'Product data not found' })
        }

        //actualizar Stock y Sold de product
        let stockDifference = -quantityDifference
        productData.stock += stockDifference
        let soldDifference = quantityDifference
        productData.sold += soldDifference
        await productData.save()

        //Calcula el cambio en el total de la factura
        let pricePerUnit = productData.price
        let priceDifference = pricePerUnit * quantityDifference

        // Actualizar el total de la factura
        bill.total += priceDifference

        let updatedBill = await bill.save()

        return res.send({ message: 'Bill product quantity updated successfully', updatedBill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating bill product quantity' })
    }
}

export const printBill = async (req, res) => {
    try {
        let { id } = req.params

        let bill = await Bill.findById(id)
        if (!bill) return res.status(404).send({ message: 'Bill not found' })

        let user = await User.findById(bill.user)
        if (!user) return res.status(404).send({ message: 'User not found' })
        if (req.user._id.toString() !== user._id.toString()) return res.status(403).send({ message: 'Unauthorized print bill for this buy' })
        //------------------------------------------------------------
        //crear el PDF
        let doc = new PDFDocument()

        //nombre del archivo
        let fileName = `bill_${id}.pdf`

        // Crear el contenido del PDF
        doc
            .fontSize(20)
            .text('Factura', { align: 'center' })
            .moveDown()

        doc
            .fontSize(12)
            .text(`Tipo de Factura: ${bill.typeBill}`, { align: 'center' })
            .text(`Fecha de Emision: ${bill.date.toLocaleDateString()}`, { align: 'center' })
            .text(`Username: ${user.username}`, { align: 'center' })
            .text(`idUsuario: ${bill.user}`, { align: 'center' })
            .text(`idFactura: ${bill._id}`, { align: 'center' })


            .moveDown()

        let totalCompra = 0

        //calcular el total de la compra
        for (let item of bill.products) {
            let productData = await Product.findById(item.product)
            if (productData) {
                totalCompra += productData.price * item.quantity
            }
        }

        //detalles de la factura
        for (let item of bill.products) {
            let productData = await Product.findById(item.product)
            if (productData) {
                let subtotal = productData.price * item.quantity
                doc.text(`${productData.name} ------- (${item.quantity} x Q.${productData.price}) ---------> ${subtotal}`)
                doc.moveDown()
            }
        }

        //total de la compra
        doc.moveDown()
        doc.fontSize(14).text(`Total de la compra: ${totalCompra}`, { align: 'right' })

        //guarda el pdf en la ruta raiz
        doc.pipe(fs.createWriteStream(`${fileName}`))
        doc.end()

        return res.send({ message: 'Bill PDF generated', pdfPath: fileName })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error generating bill PDF' })
    }
}

export const getBillsByUser = async (req, res) => {
    try {
        let { username } = req.body
        let user = await User.findOne({ username })
        if (req.user._id.toString() !== user._id.toString()) return res.status(403).send({ message: 'Unauthorized viwe history for this user' })
        if (!user) return res.status(404).send({ message: 'User not found' })
        const bills = await Bill.find({ user: user._id }).populate({
            path: 'products.product',
            select: 'name price',
            model: 'product'
        })
        return res.send({ message: 'User purchase history:', bills })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error fetching bills by user' })
    }
}