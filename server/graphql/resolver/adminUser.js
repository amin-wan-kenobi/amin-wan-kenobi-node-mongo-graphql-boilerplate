import tokenUtil from '../../helpers/token-util';
import AdminUser from '../../models/adminUser';

const loginQuery = {
    login: async (args) => {
        try {
            const username = args.username;
            const password = args.password;
            const user = await AdminUser.loginByCredentials(username, password);
            const userInfo = {
                user: {
                    _id: user._id,
                },
                permissions: user.permissions,
            };
            return tokenUtil.generateToken(userInfo);
        }
        catch (e) {
            throw new Error(e);
        }
    },
};

export default loginQuery;