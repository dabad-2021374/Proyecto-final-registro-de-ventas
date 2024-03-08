import {Schema, model } from "mongoose";

const productSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    }
}, {
    versionKey: false //Desahabilitar el __v (version del documento)
})

export default model('product', productSchema)