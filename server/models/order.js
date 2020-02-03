import mongoose from 'mongoose';
import orderStatus from '../constants/orderStatus';

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    number: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
    },
    orderStatus: {
        type: String,
        required: true,
        default: orderStatus.Pending,
        enum: [orderStatus.Pending, orderStatus.Cancelled,orderStatus.Completed,],
    },
    metadata: {
        type: Array,
        key: String,
        value: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, {timestamps: true,});

export default mongoose.model('Order', orderSchema);