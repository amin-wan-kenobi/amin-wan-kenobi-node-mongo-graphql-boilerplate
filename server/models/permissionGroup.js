import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const permissionGroupSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    permissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Permission',
    },],
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

export default mongoose.model('PermissionGroup', permissionGroupSchema);