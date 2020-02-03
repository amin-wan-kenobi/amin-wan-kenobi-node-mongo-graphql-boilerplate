import mongoose from 'mongoose';
import status from '../constants/status';

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    coordinates: {
        longitude: String,
        latitude: String,
    },
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order',
        },
    ],
    status: {
        type: String,
        required: true,
        default: status.Active,
        enum: [status.Active, status.Inactive,],
    },
    metadata: {
        type: Array,
        key: String,
        value: String,
    },
    createdBy: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true, });

export default mongoose.model('Customer', customerSchema);