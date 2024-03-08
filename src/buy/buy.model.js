import mongoose, {Schema, mongo} from "mongoose"

const buySchema = mongoose.Schema({
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
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
}, {
    versionKey: false
})

export default mongoose.model('buy', buySchema)