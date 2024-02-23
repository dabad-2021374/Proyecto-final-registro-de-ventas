import mongoose, {mongo} from "mongoose"

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export default mongoose.model('category', categorySchema)