import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import messageUtil from '../helpers/message-util';

const Schema = mongoose.Schema;

const adminUserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email',
        },
    },
    username: {
        type: String,
        required: true,
        minlength: 1,
    },
    password: {
        type: String,
        required: true,
        minlength: 1,
    },
    company: {
        type: String,
        required: true,
        minlength: 1,
    },
    permissions: [Number,],
    permissionGroups: [{
        type: Schema.Types.ObjectId,
        ref: 'PermissionGroup',
    },],
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

adminUserSchema.statics.loginByCredentials = async function (username, password) {
    const AdminUser = this;
    const user = await AdminUser.findOne({ username, });
    if(!user){
        return Promise.reject(messageUtil.WRONG_CREDENTIALS);
    }
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                resolve(user);
            } else {
                reject(messageUtil.WRONG_CREDENTIALS);
            }
        });
    });
};

adminUserSchema.pre('save', function (next) {
    const adminUser = this;
    //Only if password is updated. No need for condition at this point
    bcrypt.genSalt(10, (err, salt) => {
        if (salt) {
            bcrypt.hash(adminUser.password, salt, (err, hash) => {
                if (hash) {
                    adminUser.password = hash;
                    next();
                }
            });
        }
    });
});

export default mongoose.model('AdminUser', adminUserSchema);