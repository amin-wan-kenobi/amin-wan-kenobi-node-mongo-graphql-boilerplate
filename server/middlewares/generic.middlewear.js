import tokenUtil from '../helpers/token-util';
import MessageUtil from '../helpers/message-util';
import tokenAuthenticateMiddlewear from './token-authenticate.middlewear';

const genericMiddlewear = (fullPermission, specificPermission, req, res, next = () => {/** */ }) => {
    tokenAuthenticateMiddlewear(req, res, next);
    
    if (!req) {
        return next();
    }
    const token = tokenUtil.getToken(req);
    const permissions = tokenUtil.getPermissions(token);
    
    if(permissions.indexOf(fullPermission) > -1 || permissions.indexOf(specificPermission) > -1){
        return next();
    }
    else{
        throw MessageUtil.ACCESS_DENIED;
    }
};
export default genericMiddlewear;