import mongoose, { Schema, mongo } from "mongoose"

const billSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
        }
    ],
    typeBill: {
        type: String,
        default: "Electronic Bill"
    },
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    buy: {
        type: Schema.Types.ObjectId,
        ref: 'buy',
        required: true
    }
}, {
    versionKey: false
})

export default mongoose.model('bill', billSchema)