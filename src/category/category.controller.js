'use strict'

import Category from './category.model.js'
import Product from '../product/product.model.js'
import { checkUpdate } from '../utils/validator.js'

export const addCategory = async (req, res) => {
    try {
        let data = req.body
        console.log(data)

        let category = new Category(data)
        await category.save()

        return res.send({message: `Registered successfully category`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error registering category', err: err})
    }
}

export const getCategories = async (req, res) => {
    try {
        let categories = await Category.find();
        return res.send({categories});
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching categories', err: err });
    }
}

export const updateCategory = async (req, res) => {
    try {
        //Capturar la data
        let data = req.body
        //Capturar el id de la categoria a actualizar
        let { id } = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if (!update) return res.status(400).send({ message: 'You have sent data that cannot be updated' })
        //Actualizar
    let updatedCategory = await Category.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
        )
        //Validar la actualización
        if(!updatedCategory) return res.status(404).send({message: 'Category not found and not updated'})
        //Responder si todo sale bien
        return res.send({message: 'Category updated successfully', updatedCategory})
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating category' })
    }
}

export const deleteCategory = async(req, res)=>{
    try{
        //Capturar el id de la 'categoria' a eliminar
        let { id } = req.params

        let defaultCategory = await Category.findOne({ name: 'Default' });
        await Product.updateMany({ category: id }, { category: defaultCategory._id });
        //Eliminar
        let deletedCategory = await Category.deleteOne({_id: id})
        //Validar que se eliminó
        if(deletedCategory.deletedCount === 0) return res.status(404).send({message: 'Category not found and not deleted'})
        //Responder
        return res.send({message: 'Deleted category successfully'})
    }catch(err){
        console.error(err)
        return res.status(404).send({message: 'Error deleting category'})
    }
}

export const defaultCategory = async () => {
    try {
        let createCategory = await Category.findOne({ name: 'Default' });
        if (createCategory) {
            return; 
        }
        let data = {
            name: 'Default',
            description: 'Categoria por defecto'
        }
        let category = new Category(data)
        await category.save()

    } catch (error) {
        console.error(error)
    }
}

export const getProductsForCategory = async (req, res) => {
    try {
        let { id } = req.params;
        let category = await Category.findById(id);
        if (!category) return res.status(404).send({ message: 'Categorie not found' })
        let products = await Product.find({ category: id });
        return res.send({ category, products });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching category and products', err: err });
    }
}

export const searchProductsForCategory = async (req, res) => {
    try {
        let { search } = req.body;

        // Buscar la categoría por su nombre
        const category = await Category.findOne({ name: search });
        if (!category) {
            return res.status(404).send({ message: 'Category not found' });
        }

        // Buscar los productos asociados a la categoría
        const products = await Product.find({ category: category._id });

        // Devolver la categoría y sus productos asociados
        return res.send({ category, products });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching category and products', err });
    }
}

export const searchCategByCoinci = async (req, res) => {
    try {
        let { search } = req.body
        let categories = await Category.find({ name: { $regex: search, $options: 'i' } })
        if (categories.length === 0) {
            return res.status(404).send({ message: 'Categories not found' })
        }
        return res.send({ categories })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching categories', err })
    }
}