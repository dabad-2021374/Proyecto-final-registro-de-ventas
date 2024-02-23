'use strict'

import Category from './category.model.js'
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
        //Capturar el id del animal a actualizar
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