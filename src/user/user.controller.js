'use strict' //Modo estricto

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'
import Buy from '../buy/buy.model.js'

export const testU = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const registerU = async (req, res) => {
    try {
        let data = req.body
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

export const registerA = async (req, res) => {
    try {
        let data = req.body
        data.password = await encrypt(data.password)
        data.role = 'ADMIN'
        let user = new User(data)
        await user.save() 
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

export const login = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = await User.findOne({ 
            $or: [{ username }, { email }] 
        })
        if (!user) {
            return res.status(404).send({ message: 'Invalid username or email' })
        }
        if (await checkPassword(password, user.password)) {
            const loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name
            }
            const Buys = await Buy.find({ user: user._id })
            const token = await generateJwt(loggedUser)
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token, message1: 'HISTORY BUYS', Buys })
        }
        return res.status(404).send({ message: 'Invalid password' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error logging in', error })
    }
}

export const updateU = async (req, res) => { //Datos generales (No password)
    try {
        //Obtener el id del usuario a actualizar
        let { id } = req.params
        //Obtener los datos a actualizar
        let data = req.body
        let user = await User.findOne({ _id: id })
        if (!user) return res.status(404).send({ message: 'User not found' })
        if (req.user._id.toString() !== user._id.toString()) return res.status(403).send({ message: 'Unauthorized to update for this user' })
        //Validar si data trae datos
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        //Validar si tiene permisos (tokenización) X Hoy No lo vemos X
        //Actualizar (BD)
        let updatedUser = await User.findOneAndUpdate(
            { _id: id }, //ObjectsId <- hexadecimales (Hora sys, Version Mongo, Llave privada...)
            data, //Los datos que se van a actualizar
            { new: true } //Objeto de la BD ya actualizado
        )
        //Validar la actualización
        if (!updatedUser) return res.status(401).send({ message: 'User not found and not updated' })
        //Respondo al usuario
        return res.send({ message: 'Updated user', updatedUser })
    } catch (err) {
        console.error(err)
        if (err.keyValue.username) return res.status(400).send({ message: `Username ${err.keyValue.username} is alredy taken` })
        return res.status(500).send({ message: 'Error updating account' })
    }
}

export const updateRole = async (req, res) => {
    try {
        // Obtener el id del usuario a actualizar
        const { id } = req.params;

        // Obtener el nuevo rol del usuario desde el body
        const { role } = req.body;

        // Verificar si el nuevo rol es válido
        if (!['ADMIN', 'CLIENT'].includes(role.toUpperCase())) return res.status(400).send({ message: 'Invalid role' });

        // Buscar el usuario por su id
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Actualizar el rol del usuario
        user.role = role.toUpperCase();
        const updatedUser = await user.save();

        // Responder al usuario con el usuario actualizado
        return res.send({ message: 'User role updated successfully', updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating user role' });
    }
}

export const deleteU = async(req, res)=>{
    try{
        let { id } = req.params
        let user = await User.findOne({ _id: id })
        if (!user) return res.status(404).send({ message: 'User not found' })
        if (req.user._id.toString() !== user._id.toString()) return res.status(403).send({ message: 'Unauthorized to update for this user' })
        let deletedUser = await User.findOneAndDelete({_id: id}) 
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not deleted'})
        return res.send({message: `Account with username ${deletedUser.username} deleted successfully`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting account'})
    }
}

export const defaultAdmin = async () => {
    try {
        const createUser = await User.findOne({ username: 'default' })
        if (createUser) {
            return; 
        }
        let data = {
            name: 'default',
            surname: 'default',
            username: 'default',
            email: 'default@kinal.edu.gt',
            phone: '12345678',
            password: await encrypt('123'),
            role: 'ADMIN'
        }
        let user = new User(data)
        await user.save()
        console.log('Admin for default created with username "default" and password "123"')
    } catch (error) {
        console.error(error)
    }
}

export const updatePass = async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;
        let user = await User.findOne({ username });

        //Solo el usuario puede actualizar su password
        if (req.user._id.toString() !== user._id.toString()) return res.status(403).send({ message: 'Unauthorized to update password for this user' })
        
        // Verificar si el usuario existe y si la contraseña antigua es valida
        if (user && await checkPassword(oldPassword, user.password)) {
            const encryptedNewPassword = await encrypt(newPassword);
            user.password = encryptedNewPassword;
            await user.save();
            return res.send({ message: 'Password updated successfully' });
        }
        return res.status(400).send({ message: 'Invalid username or old password' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating password' });
    }
}