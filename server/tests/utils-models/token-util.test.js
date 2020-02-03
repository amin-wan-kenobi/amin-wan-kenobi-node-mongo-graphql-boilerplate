import expect from 'expect';
import { ObjectID, } from 'mongodb';
import TokenUtil from '../../helpers/token-util';

describe('---------------------- TOKEN UTILS ----------------------', () => {
    const data = {
        user:
        {
            _id: new ObjectID(),
        },
        permissions: [1, 2, 3, 4,],
    };

    it('should successfully generate Json Web Token', () => {
        const token = TokenUtil.generateToken(data);
        expect(token).toBeTruthy();
        expect(token.split('.').length).toBe(3);
    });

    it('should successfully get user object from a token', () => {
        const token = TokenUtil.generateToken(data);
        const user = TokenUtil.getUser(token);
        expect(user.toString()).toBe(data.user.toString());
    });

    it('should successfully get user id from a token', () => {
        const token = TokenUtil.generateToken(data);
        const id = TokenUtil.getUserId(token);
        expect(id).toEqual(data.user._id);
    });

    it('should successfully validate a valid token', () => {
        const token = TokenUtil.generateToken(data);
        const validated = TokenUtil.validateToken(token);
        expect(validated).toBe(true);
    });

    it('should fail an invalid token', () => {
        const token = TokenUtil.generateToken(data);
        try {
            TokenUtil.validateToken(token + '1');
        } catch (e) {
            expect(e.name).toBe('JsonWebTokenError');
        }
    });

    it('should fail a valid but expired token', (done) => {
        const token = TokenUtil.generateToken(data, '0.1s');
        setTimeout(() => {
            try {
                TokenUtil.validateToken(token, false);
            }
            catch (e) {
                expect(e.name).toBe('TokenExpiredError');
                done();
            }
        }, 200);
    });

    it('should pass a valid but expired token if expiry is not important', (done) => {
        const token = TokenUtil.generateToken(data, '0.1s');
        setTimeout(() => {
            const validated = TokenUtil.validateToken(token);
            expect(validated).toBe(true);
            done();
        }, 200);
    });

    it('should fail getting a user from an invalid token', () => {
        const token = TokenUtil.generateToken(data);
        try {
            TokenUtil.getUser(token + '1');
        } catch (e) {
            expect(e).toBe('JsonWebTokenError');
        }
    });

    it('should fail getting a userId from an invalid token', () => {
        const token = TokenUtil.generateToken(data);
        try {
            TokenUtil.getUserId(token + '1');
        } catch (e) {
            expect(e).toBe('JsonWebTokenError');
        }
    });

    it('should successfully receive list of permissions from a token', () => {
        const token = TokenUtil.generateToken(data);
        const perrmission = TokenUtil.getPermissions(token);
        expect(perrmission).toEqual(expect.arrayContaining(data.permissions));
    });

    it('should fail getting a list of permissions from an invalid token', () => {
        const token = TokenUtil.generateToken(data);
        try {
            TokenUtil.getPermissions(token + '1');
        } catch (e) {
            expect(e).toBe('JsonWebTokenError');
        }
    });

    it('should fail getting a list of permissions from a valid but expired token', (done) => {
        const token = TokenUtil.generateToken(data, '0.1s');
        setTimeout(() => {
            try {
                TokenUtil.getPermissions(token, false);
            } catch (e) {
                expect(e).toBe('TokenExpiredError');
                done();
            }
        }, 200);
    });
});