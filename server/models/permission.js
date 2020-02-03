import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    permissionName: {
        type: String,
        required: true,
    },
    permissionScope: {
        type: String,
        required: true,
    },
    scopeId: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
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
}, { timestamps: true, });

export default mongoose.model('Permission', permissionSchema);