import tokenUtil from '../helpers/token-util';
import MessageUtil from '../helpers/message-util';

const tokenAuthenticateMiddlewear = (req, res, next = () => {/** */ }) => {
    if (!req) {
        return next();
    }
    const authToken = req.header('Authorization');
    if (!authToken) {
        throw MessageUtil.NO_TOKEN;
    }
    const token = authToken.split(' ')[1];
    if (!token || token === '') {
        throw MessageUtil.NO_TOKEN;
    }
    try {
        tokenUtil.validateToken(token);
    } catch (e) {
        switch (e.name) {
            case 'JsonWebTokenError':
                throw MessageUtil.WRONG_TOKEN;
            case 'TokenExpiredError':
                throw MessageUtil.EXPIRED_TOKEN;
        }
    }
    req.userId = tokenUtil.getUserId(token);
    return next();
};
export default tokenAuthenticateMiddlewear;