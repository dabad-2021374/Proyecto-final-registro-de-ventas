'use strict'

import Product from './product.model.js'
import { checkUpdate } from '../utils/validator.js'

export const addProduct = async (req, res) => {
    try {
        let data = req.body
        data.sold = 0
        
        let product = new Product(data)
        await product.save()

        return res.send({message: `Registered successfully product`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error registering product', err: err})
    }
}

export const getProducts = async (req, res) => {
    try {
        let products = await Product.find().populate('category', ['name'])
        return res.send({products});
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching product', err: err });
    }
}

export const searchProduct = async(req, res)=>{
    try{
        //Obtener el parámetro de búsqueda
        let { search } = req.body
        //Buscar
        let products = await Product.find(
            {name: search}
        ).populate('category', ['name', 'description'])
        //Validar la respuesta
        if(!products) return res.status(404).send({message: 'Products not found'})
        //Responder si todo sale bien
        return res.send({message: 'Products found', products})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching products'})
    }
}

export const soldOutProducts = async (req, res) => {
    try {
        // Buscar productos con stock agotado
        let products = await Product.find({ stock: 0 });
        // Validar la respuesta
        if(products.length === 0) return res.status(404).send({ message: 'No products with stock 0 found' });
        // Responder si todo sale bien
        return res.send({ message: 'Products with stock 0 found / soldOut', products });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching products', err: err });
    }
}

export const updateProduct = async (req, res) => {
    try {
        //Capturar la data
        let data = req.body
        //Capturar el id del animal a actualizar
        let { id } = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if (!update) return res.status(400).send({ message: 'You have sent data that cannot be updated' })
        //Actualizar
    let updateProduct = await Product.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
        )
        //Validar la actualización
        if(!updateProduct) return res.status(404).send({message: 'Product not found and not updated'})
        //Responder si todo sale bien
        return res.send({message: 'Product updated successfully', updateProduct})
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating product' })
    }
}

export const deleteProduct= async(req, res)=>{
    try{
        //Capturar el id de la 'producto' a eliminar
        let { id } = req.params
        //Eliminar
        let deletedProduct = await Product.deleteOne({_id: id})
        //Validar que se eliminó
        if(deletedProduct.deletedCount === 0) return res.status(404).send({message: 'Product not found and not deleted'})
        //Responder
        return res.send({message: 'Deleted product successfully'})
    }catch(err){
        console.error(err)
        return res.status(404).send({message: 'Error deleting product'})
    }
}

export const filterMoreSold = async (req, res) => {
    try {
        let products = await Product.find().sort({ sold: -1 })

        return res.send({ products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching products' })
    }
}

export const productByCoincidence = async (req, res) => {
    try {
        let { search } = req.body
        let products = await Product.find({ name: { $regex: search, $options: 'i' } })
            .populate('category', ['name', 'description'])
        if (products.length === 0) return res.status(404).send({ message: 'Products not found' })
        return res.send({ products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching products', err })
    }
}

