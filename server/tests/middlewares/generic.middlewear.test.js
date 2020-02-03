import expect from 'expect';
import { ObjectID, } from 'mongodb';
import SCOPES from '../../permissions/permissions-scope-constants';
import tokenUtil from '../../helpers/token-util';
import genericMiddlewear from '../../middlewares/generic.middlewear';
import MessageUtil from '../../helpers/message-util';

describe('---------------------- GENERIC MIDDLEWARE ----------------------', () => {
    const nextFunc = () => 'NextFunction';
    const userInfo = {
        user: {
            _id: new ObjectID(),
        },
    };

    it('should pass if no request is passed', () => {
        expect(genericMiddlewear(null, null, null, null, nextFunc)).toBe('NextFunction');
    });

    describe('-- CUSTOMER MIDDLEWEAR --', () => {
        it('it should pass when user is allowed to use customers function', () => {
            userInfo.permissions = [SCOPES.CUSTOMER.customers,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.customers, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });

        it('it should give access denied error (4001) when user is not allowed to use customers function', () => {
            userInfo.permissions = [];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.customers, req, null, nextFunc);
            } catch (e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.ACCESS_DENIED);
            }
        });

        it('it should pass when user is allowed to use saveCustomer function', () => {
            userInfo.permissions = [SCOPES.CUSTOMER.saveCustomer,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.saveCustomer, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });

        it('it should give access denied error (4001) when user is not allowed to use saveCustomer function', () => {
            userInfo.permissions = [];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.saveCustomer, req, null, nextFunc);
            } catch (e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.ACCESS_DENIED);
            }
        });

        it('it should pass when user is allowed to use getCustomerById function', () => {
            userInfo.permissions = [SCOPES.CUSTOMER.getCustomerById,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.getCustomerById, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });

        it('it should give access denied error (4001) when user is not allowed to use getCustomerById function', () => {
            userInfo.permissions = [];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.getCustomerById, req, null, nextFunc);
            } catch (e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.ACCESS_DENIED);
            }
        });

        it('it should pass if user has permission to use all the functions in customer resolver', () => {
            userInfo.permissions = [SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.customers, req, null, nextFunc)).toBe('NextFunction');
                expect(genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.saveCustomer, req, null, nextFunc)).toBe('NextFunction');
                expect(genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.getCustomerById, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });
    });

    describe('-- ORDER MIDDLEWEAR --', () => {
        it('it should pass when user is allowed to use orders function', () => {
            userInfo.permissions = [SCOPES.ORDER.orders,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.orders, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });

        it('it should give access denied error (4001) when user is not allowed to use orders function', () => {
            userInfo.permissions = [];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.orders, req, null, nextFunc);
            } catch (e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.ACCESS_DENIED);
            }
        });

        it('it should pass when user is allowed to use saveOrder function', () => {
            userInfo.permissions = [SCOPES.ORDER.saveOrder,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.saveOrder, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });

        it('it should give access denied error (4001) when user is not allowed to use saveOrder function', () => {
            userInfo.permissions = [];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.saveOrder, req, null, nextFunc);
            } catch (e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.ACCESS_DENIED);
            }
        });

        it('it should pass when user is allowed to use getOrderById function', () => {
            userInfo.permissions = [SCOPES.ORDER.getOrderById,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.getOrderById, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });

        it('it should give access denied error (4001) when user is not allowed to use getOrderById function', () => {
            userInfo.permissions = [];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.getOrderById, req, null, nextFunc);
            } catch (e) {
                expect(e).toBeTruthy();
                expect(e).toBe(MessageUtil.ACCESS_DENIED);
            }
        });

        it('it should pass if user has permission to use all the functions in order resolver', () => {
            userInfo.permissions = [SCOPES.ORDER.ALL_ORDER_SCOPE,];
            const token = tokenUtil.generateToken(userInfo);
            const req = {
                header: (param) => {
                    if (param === 'Authorization') {
                        return `Basic ${token}`;
                    }
                },
            };
            try {
                expect(genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.orders, req, null, nextFunc)).toBe('NextFunction');
                expect(genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.saveOrder, req, null, nextFunc)).toBe('NextFunction');
                expect(genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.getOrderById, req, null, nextFunc)).toBe('NextFunction');
            } catch (e) {
                expect(e).toBeFalsy();
            }
        });
    });
});