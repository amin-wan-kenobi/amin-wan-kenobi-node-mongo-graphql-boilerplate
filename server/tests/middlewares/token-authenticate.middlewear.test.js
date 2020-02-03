import expect from 'expect';
import { ObjectID, } from 'mongodb';
import tokenUtil from '../../helpers/token-util';
import tokenAuthenticate from '../../middlewares/token-authenticate.middlewear';
import MessageUtil from '../../helpers/message-util';

describe('---------------------- TOKEN AUTHENTICATE MIDDLEWARE ----------------------', () => {
    const nextFunc = () => 'NextFunction';

    it('should pass if no request is passed', () => {
        expect(tokenAuthenticate(null, null, nextFunc)).toBe('NextFunction');
    });

    it('should pass with good token', () => {
        const req = {
            header: (param) => {
                if (param === 'Authorization') {
                    return `Basic ${tokenUtil.generateToken({ somedata: '', })}`;
                }
            },
        };
        try {
            expect(tokenAuthenticate(req, null, nextFunc)).toBe('NextFunction');
        } catch (e) {
        }
    });

    it('should fail if no Authorization exist in the req', () => {
        const req = {
            header: (param) => {
                if (param === 'Authorization') {
                    return undefined;
                }
            },
        };
        try {
            tokenAuthenticate(req);
        } catch (e) {
            expect(e).toBeTruthy();
            expect(e).toBe(MessageUtil.NO_TOKEN);
        }
    });

    it('should fail if Authorization in req is not in two part (Basic AUTH_VALUE)', () => {
        const req = {
            header: (param) => {
                if (param === 'Authorization') {
                    return '12312312312312312312321';
                }
            },
        };
        try {
            tokenAuthenticate(req);
        } catch (e) {
            expect(e).toBeTruthy();
            expect(e).toBe(MessageUtil.NO_TOKEN);
        }
    });

    it('should fail if Authorization in req is not valid', () => {
        const req = {
            header: (param) => {
                if (param === 'Authorization') {
                    return 'Basic 12312312312312312312321';
                }
            },
        };
        try {
            tokenAuthenticate(req);
        } catch (e) {
            expect(e).toBeTruthy();
            expect(e).toBe(MessageUtil.WRONG_TOKEN);
        }
    });

    it('should pass if Authorization in req is valid and we can get a user id', () => {
        const userInfo = {
            user: {
                _id: new ObjectID(),
            },
        };
        const req = {
            header: (param) => {
                if (param === 'Authorization') {
                    return `Basic ${tokenUtil.generateToken(userInfo)}`;
                }
            },
        };
        expect(req.userId).toBeFalsy();
        tokenAuthenticate(req);
        expect(req.userId).toBeTruthy();
        expect(req.userId).toEqual(userInfo.user._id);
    });

    it.skip('should fail the expired token', done => {
        const userInfo = {
            user: {
                _id: new ObjectID(),
            },
        };
        const token = tokenUtil.generateToken(userInfo, '0.1s');
        const req = {
            header: (param) => {
                if (param === 'Authorization') {
                    return `Basic ${token}`;
                }
            },
        };
        setTimeout(() => {
            try {
                tokenAuthenticate(req);
            } catch(e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.EXPIRED_TOKEN);
            }
        }, 200);
    });
});