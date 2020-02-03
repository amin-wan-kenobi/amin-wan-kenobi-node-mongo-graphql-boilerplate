import jwt from 'jsonwebtoken';
import { ObjectID, } from 'mongodb';
import MessageUtil from '../helpers/message-util';

const tokenUtil = {
    generateToken: (data, expiresIn = process.env.JWT_EXPIRY_TIME) => {
        let token = jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn,
            subject: 'cng',
        }).toString();
        return token;
    },
    getToken: (req) => {
        const authToken = req.header('Authorization');
        if (!authToken) {
            throw MessageUtil.NO_TOKEN;
        }
        const token = authToken.split(' ')[1];
        if (!token || token === '') {
            throw MessageUtil.NO_TOKEN;
        }
        return token;
    },
    validateToken: (token, ignoreExpiration = process.env.IGNORE_EXPIRY) => {
        try {
            jwt.verify(token, process.env.JWT_SECRET, {
                ignoreExpiration,
            });
            return true;
        } catch (err) {
            throw err;
        }
    },
    getUser: (token, ignoreExpiration = process.env.IGNORE_EXPIRY) => {
        try {
            let decodedData = jwt.verify(token, process.env.JWT_SECRET, {
                ignoreExpiration,
            });
            return decodedData.user;
        } catch (err) {
            throw err.name;
        }
    },
    getUserId: (token, ignoreExpiration = process.env.IGNORE_EXPIRY) => {
        try {
            let decodedData = jwt.verify(token, process.env.JWT_SECRET, {
                ignoreExpiration,
            });
            if(decodedData && decodedData.user){
                return new ObjectID(decodedData.user._id);
            }
            return null;
        } catch (err) {
            throw err.name;
        }
    },
    getPermissions: (token, ignoreExpiration = process.env.IGNORE_EXPIRY) => {
        try {
            let decodedData = jwt.verify(token, process.env.JWT_SECRET, {
                ignoreExpiration,
            });
            return decodedData.permissions;
        } catch (err) {
            throw err.name;
        }
    },
};

export default tokenUtil;