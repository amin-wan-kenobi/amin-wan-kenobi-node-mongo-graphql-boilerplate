import expect from 'expect';
import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList, GraphQLObjectType, } from 'graphql';
import request from 'supertest';
import { ObjectID, } from 'mongodb';

import { app, } from '../../server';
import Order from '../../models/order';
import allSchemas from '../../graphql/schema';
import orderResolver from '../../graphql/resolver/order';
import { seedOrder, } from '../seeds/order-seed';
import { seedCustomer, } from '../seeds/customer-seed';
import { populateOrderCustomer, } from '../seeds/seed-factory';
import TokenUtil from '../../helpers/token-util';
import MessageUtil from '../../helpers/message-util';
import IdUtil from '../../helpers/id-util';
import SCOPES from '../../permissions/permissions-scope-constants';
import orderStatus from '../../constants/orderStatus';

describe('---------------------- Order ----------------------', () => {
    const order = allSchemas.getType('Order').toConfig();
    const orderInput = allSchemas.getType('OrderInput').toConfig();

    const URL = '/graphql';

    const orderToBeCreated = {
        number: 'Best Order',
        customer: seedCustomer[0]._id,
        createdBy: seedOrder[0].createdBy,
        metadata: [{
            key: 'Key1',
            value: 'Value to Key1',
        },],
    };

    describe('-- OrderType Schema --', () => {
        it('should pass when all the existing types are in the Order Schema', () => {
            expect(order).toBeTruthy();

            expect(Object.keys(order.fields).length).toBe(7);

            expect(order.fields).toHaveProperty('_id');
            expect(order.fields._id.type).toEqual(GraphQLNonNull(GraphQLID));

            expect(order.fields).toHaveProperty('number');
            expect(order.fields.number.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(order.fields).toHaveProperty('customer');
            expect(order.fields.customer.type.toString()).toEqual(GraphQLNonNull(new GraphQLObjectType({ name: 'Customer', })).toString());

            expect(order.fields).toHaveProperty('orderStatus');
            expect(order.fields.orderStatus.type.toString()).toEqual(GraphQLNonNull(new GraphQLObjectType({ name: 'OrderStatus', })).toString());

            expect(order.fields).toHaveProperty('metadata');
            expect(order.fields.metadata.type.toString()).toEqual(GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'Metadata', })))).toString());

            expect(order.fields).toHaveProperty('createdBy');
            expect(order.fields.createdBy.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(order.fields).toHaveProperty('updatedBy');
            expect(order.fields.updatedBy.type).toEqual(GraphQLString);
        });

        it('should pass when OrderInput is present', () => {
            expect(orderInput).toBeTruthy();

            expect(Object.keys(orderInput.fields).length).toBe(3);

            expect(orderInput.fields).toHaveProperty('number');
            expect(orderInput.fields.number.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(orderInput.fields).toHaveProperty('customer');
            expect(orderInput.fields.customer.type).toEqual(GraphQLNonNull(GraphQLID));

            expect(orderInput.fields).toHaveProperty('metadata');
            expect(orderInput.fields.metadata.type.toString()).toEqual(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'MetadataInput', }))).toString());
        });
    });

    describe('-- Order Resolvers --', () => {
        beforeEach(populateOrderCustomer);
        it('should pass when orders resolver returns a LIST OF ORDERS', done => {
            orderResolver.orders()
                .then(ordersFromDB => {
                    expect(ordersFromDB.length).toBe(2);
                    expect(ordersFromDB).toEqual(expect.arrayContaining([
                        expect.objectContaining(
                            {
                                _id: seedOrder[0]._id.toHexString(),
                                number: seedOrder[0].number,
                                orderStatus: orderStatus.Pending,
                            }),
                    ]));
                    expect(ordersFromDB).toEqual(expect.arrayContaining([
                        expect.objectContaining(
                            {
                                _id: seedOrder[1]._id.toHexString(),
                                number: seedOrder[1].number,
                                orderStatus: orderStatus.Pending,
                            }),
                    ]));
                    expect(typeof ordersFromDB[0].customer).toBe('function');
                    expect(ordersFromDB[0].createdBy).toEqual(seedOrder[0].createdBy);
                    expect(ordersFromDB[0].metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when saveOrder resolver CREATES AN ORDER and return it back', done => {
            orderResolver.saveOrder({ order: orderToBeCreated, })
                .then(savedOrder => {
                    expect(savedOrder).toBeTruthy();
                    expect(savedOrder._id).toBeTruthy();
                    expect(savedOrder.number).toBe(orderToBeCreated.number);
                    expect(savedOrder.orderStatus).toBe(orderStatus.Pending);
                    expect(typeof savedOrder.customer).toBe('function');
                    expect(savedOrder.metadata).toEqual(expect.arrayContaining(orderToBeCreated.metadata));
                    expect(savedOrder.createdBy).toEqual(orderToBeCreated.createdBy);
                    return Order.findOne({ number: orderToBeCreated.number, });
                })
                .then(order => {
                    expect(order).toBeTruthy();
                    expect(order.number).toBe(orderToBeCreated.number);
                    expect(order.orderStatus).toBe(orderStatus.Pending);
                    expect(order.customer).toEqual(orderToBeCreated.customer);
                    expect(order.metadata).toEqual(expect.arrayContaining(orderToBeCreated.metadata));
                    expect(order.createdBy).toEqual(orderToBeCreated.createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when order is not created when customer is not valid or does not exist', done => {
            let orderWithoutCustomer = Object.assign({}, orderToBeCreated);
            orderWithoutCustomer.customer = new ObjectID();
            orderResolver.saveOrder({ order: orderWithoutCustomer, })
                .then(savedOrder => {
                    if (savedOrder) {
                        done('No Customer was found for Best Order Order');
                    }
                })
                .catch(e => {
                    //Error happened but let's check to ensure the order was not created
                    Order.find({ number: orderWithoutCustomer.number, })
                        .then(order => {
                            if (order && order.length > 0) {
                                done(e);
                            } else {
                                done();
                            }
                        });
                });
        });

        it('should pass when updateOrder resolver UPDATES AN ORDER - its number', done => {
            const number = 'UpdateNumber';
            orderResolver.updateOrder({ _id: seedOrder[0]._id, number, })
                .then(updatedOrder => {
                    expect(updatedOrder._id).toEqual(seedOrder[0]._id.toHexString());
                    expect(updatedOrder.number).toBe(number);
                    expect(typeof updatedOrder.customer).toBe('function');
                    expect(updatedOrder.orderStatus).toEqual(orderStatus.Pending);
                    expect(updatedOrder.createdBy).toEqual(seedOrder[0].createdBy);
                    expect(updatedOrder.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    return Order.findById(seedOrder[0]._id);
                })
                .then(order => {
                    expect(order).toBeTruthy();
                    expect(order.number).toBe(number);
                    expect(order.customer.toString()).toEqual(seedOrder[0].customer.toString());
                    expect(order.orderStatus).toEqual(orderStatus.Pending);
                    expect(order.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    expect(order.createdBy).toEqual(seedOrder[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when updateOrder resolver UPDATES AN ORDER - everything', done => {
            const number = 'UpdatingExistingOrder';
            const metadata = [{
                key: 'Key1',
                value: 'UPDATED Some Information about Key1',
            }, {
                key: 'Key2',
                value: 'UPDATED Some Information about Key2',
            },];
            orderResolver.updateOrder({ _id: seedOrder[0]._id, number, metadata, })
                .then(updatedOrder => {
                    expect(updatedOrder._id).toEqual(seedOrder[0]._id.toHexString());
                    expect(updatedOrder.number).toBe(number);
                    expect(updatedOrder.orderStatus).toEqual(orderStatus.Pending);
                    expect(typeof updatedOrder.customer).toBe('function');
                    expect(updatedOrder.createdBy).toEqual(seedOrder[0].createdBy);
                    expect(updatedOrder.metadata).toEqual(expect.arrayContaining(metadata));
                    return Order.findById(seedOrder[0]._id);
                })
                .then(order => {
                    expect(order).toBeTruthy();
                    expect(order.number).toBe(number);
                    expect(order.orderStatus).toEqual(orderStatus.Pending);
                    expect(order.metadata).toEqual(expect.arrayContaining(metadata));
                    expect(order.createdBy).toEqual(seedOrder[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when getOrderById returns AN ORDER', done => {
            orderResolver.getOrderById({ id: seedOrder[0]._id, })
                .then(ordersFromDB => {
                    expect(ordersFromDB._id).toEqual(seedOrder[0]._id.toHexString());
                    expect(ordersFromDB.number).toBe(seedOrder[0].number);
                    expect(typeof ordersFromDB.customer).toBe('function');
                    expect(ordersFromDB.createdBy).toEqual(seedOrder[0].createdBy);
                    expect(ordersFromDB.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    done();
                })
                .catch(e => done(e));
        });

        it('should fail when getOrderById does not receive any id', done => {
            orderResolver.getOrderById()
                .then(ordersFromDB => {
                    done(ordersFromDB);
                })
                .catch(e => done());
        });

        it('should fail when getOrderById receives an id but it is not ObjectID', done => {
            orderResolver.getOrderById({ id: '12345', })
                .then(ordersFromDB => {
                    done(ordersFromDB);
                })
                .catch(e => done());
        });

        it('should pass when deleteOrder resolver DELETES AN ORDER', done => {
            orderResolver.deleteOrder({ _id: seedOrder[0]._id, })
                .then(deletedOrder => {
                    expect(deletedOrder._id).toEqual(seedOrder[0]._id.toHexString());
                    expect(deletedOrder.number).toBe(seedOrder[0].number);
                    expect(deletedOrder.orderStatus).toEqual(orderStatus.Cancelled);
                    expect(typeof deletedOrder.customer).toBe('function');
                    expect(deletedOrder.createdBy).toEqual(seedOrder[0].createdBy);
                    expect(deletedOrder.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    return Order.findById(seedOrder[0]._id);
                })
                .then(order => {
                    expect(order).toBeTruthy();
                    expect(order.number).toBe(seedOrder[0].number);
                    expect(order.orderStatus).toEqual(orderStatus.Cancelled);
                    expect(order.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    expect(order.createdBy).toEqual(seedOrder[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should fail when deleteOrder receives an id but it is not ObjectID', done => {
            orderResolver.deleteOrder({ _id: '12345', })
                .then(deletedOrder => {
                    done(deletedOrder);
                })
                .catch(e => done());
        });
    });

    describe('-- Order GraphQL Endpoint --', () => {
        beforeEach(populateOrderCustomer);

        const userInfo = {
            user: {
                _id: seedOrder[0].createdBy,
            },
            permissions: [],
        };

        describe('- orders resolver -', () => {
            beforeEach(populateOrderCustomer);
            it('should pass when a LIST OF ORDERs are returned by using the graphql endpoint. It also has to check the orders coming from the customer', done => {
                userInfo.permissions = [SCOPES.ORDER.orders,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query {
                        orders {
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                    number
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                    }`,
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { orders, } = res.body.data;
                        expect(orders).toBeTruthy();
                        expect(orders).toEqual(expect.arrayContaining([
                            expect.objectContaining({
                                _id: seedOrder[0]._id.toHexString(),
                                number: seedOrder[0].number,
                                createdBy: seedOrder[0].createdBy.toHexString(),
                                orderStatus: orderStatus.Pending,
                            }),
                        ]));
                        expect(orders).toEqual(expect.arrayContaining([
                            expect.objectContaining({
                                _id: seedOrder[1]._id.toHexString(),
                                number: seedOrder[1].number,
                                createdBy: seedOrder[1].createdBy.toHexString(),
                                orderStatus: orderStatus.Pending,
                            }),
                        ]));
                        expect(orders[0].customer).toBeTruthy();
                        expect(orders[0].customer._id.toString()).toBe(seedOrder[0].customer.toHexString());
                        expect(orders[0].customer.name).toBe(seedCustomer[0].name);
                        expect(orders[0].orderStatus).toBe(orderStatus.Pending);
                        expect(orders[0].metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                        expect(orders[0].createdBy.toString()).toBe(seedOrder[0].createdBy.toString());
                        expect(orders[0].customer.orders[0]._id.toString()).toBe(seedOrder[0]._id.toHexString());
                        expect(orders[0].customer.orders[0].number).toBe(seedOrder[0].number);
                    })
                    .end(done);
            });

            it('should fail when user does not have permission to use the orders function', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query {
                        orders {
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                    number
                                }
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                    }`,
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(500)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toBe(MessageUtil.ACCESS_DENIED);
                    })
                    .end(done);
            });
        });

        describe('- getOrderById resolver -', () => {
            it('should pass when a order is returned for getOrderById by using the graphql endpoint. It also has to check the orders coming from the customer', done => {
                userInfo.permissions = [SCOPES.ORDER.getOrderById,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getOrderById ($id: ID!) {
                            getOrderById (id: $id) {
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                    number
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                    }`, variables: {
                            id: seedOrder[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { getOrderById, } = res.body.data;
                        expect(getOrderById._id).toEqual(seedOrder[0]._id.toHexString());
                        expect(getOrderById.number).toBe(seedOrder[0].number);
                        expect(getOrderById.orderStatus).toBe(orderStatus.Pending);
                        expect(getOrderById.customer.name).toBe(seedCustomer[0].name);
                        expect(getOrderById.customer._id.toString()).toBe(seedCustomer[0]._id.toHexString());
                        expect(getOrderById.createdBy.toString()).toEqual(seedOrder[0].createdBy.toHexString());
                        expect(getOrderById.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                    })
                    .end(done);
            });

            it('should fail when user does not have permission to use the getOrderById function', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getOrderById ($id: ID!) {
                            getOrderById (id: $id) {
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                    number
                                }
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                    }`, variables: {
                            id: seedOrder[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toBe(MessageUtil.ACCESS_DENIED);
                    })
                    .end(done);
            });

            it('should fail when no id is passed to getOrderById by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.ORDER.getOrderById,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getOrderById ($id: ID!) {
                            getOrderById (id: $id) {
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                    number
                                }
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                    }`, variables: {
                            id: undefined,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(500)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                    })
                    .end(done);
            });

            it('should fail when passed id to getOrderById is not ObjectID by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.ORDER.getOrderById,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getOrderById ($id: ID!) {
                            getOrderById (id: $id) {
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                    number
                                }
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                    }`, variables: {
                            id: '123456',
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                    })
                    .end(done);
            });
        });

        describe('- saveOrder resolver -', () => {
            it('should pass CREATION OF AN ORDER by using the graphql endpoint. It also should check and see the id of a new order already exists in the customer orders field', done => {
                userInfo.permissions = [SCOPES.ORDER.saveOrder,];
                const token = TokenUtil.generateToken(userInfo);
                let _id = null;
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveOrder ($number: String!, $customer: ID!, $metadata: [MetadataInput!]){
                            saveOrder (order: {number: $number, customer: $customer, metadata: $metadata}){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            number: orderToBeCreated.number,
                            customer: orderToBeCreated.customer,
                            metadata: orderToBeCreated.metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { saveOrder, } = res.body.data;
                        expect(saveOrder).toBeTruthy();
                        expect(saveOrder._id).toBeTruthy();
                        _id = saveOrder._id;
                        expect(saveOrder.number).toBe(orderToBeCreated.number);
                        expect(saveOrder.orderStatus).toBe(orderStatus.Pending);
                        expect(typeof saveOrder.customer).toBe('object');
                        expect(saveOrder.customer._id).toEqual(orderToBeCreated.customer.toHexString());
                        expect(saveOrder.customer.orders).toBeTruthy();
                        expect(saveOrder.customer.orders.length).toBe(2);
                        expect(saveOrder.customer.orders).toContainEqual({ _id, });
                        expect(saveOrder.metadata).toEqual(expect.arrayContaining(orderToBeCreated.metadata));
                        expect(IdUtil(saveOrder.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Order.findOne({ _id, })
                            .then(order => {
                                expect(order).toBeTruthy();
                                expect(order.number).toBe(orderToBeCreated.number);
                                expect(order.orderStatus).toEqual(orderStatus.Pending);
                                expect(order.customer).toEqual(orderToBeCreated.customer);
                                expect(order.metadata).toEqual(expect.arrayContaining(orderToBeCreated.metadata));
                                expect(IdUtil(order.createdBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));

                    });
            });

            it('should fail CREATION OF AN ORDER when user does not have permission to use saveOrder function.', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveOrder ($number: String!, $customer: ID!, $metadata: [MetadataInput!]){
                            saveOrder (order: {number: $number, customer: $customer, metadata: $metadata}){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            number: orderToBeCreated.number,
                            customer: orderToBeCreated.customer,
                            metadata: orderToBeCreated.metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toBe(MessageUtil.ACCESS_DENIED);
                    })
                    .end(done);
            });

            it('should fail ORDER CREATION when no number is provided', done => {
                let orderWithoutNumber = Object.assign({}, orderToBeCreated);
                delete orderWithoutNumber.number;
                userInfo.permissions = [SCOPES.ORDER.saveOrder,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveOrder ($customer: ID!, $metadata: MetadataInput){
                            saveOrder (order: {customer: $customer, metadata: $metadata}){
                            _id
                            number
                            customer
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            customer: orderWithoutNumber.customer,
                            metadata: orderWithoutNumber.metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(400)
                    .expect(res => {
                        const message = res.body.errors[0];
                        expect(message).toBeTruthy();
                    })
                    .end(done);
            });

            it('should fail ORDER CREATION when no customer is provided', done => {
                let orderWithoutCustomer = Object.assign({}, orderToBeCreated);
                delete orderWithoutCustomer.customer;
                userInfo.permissions = [SCOPES.ORDER.saveOrder,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveOrder ($number: String!, $metadata: MetadataInput){
                            saveOrder (order: {number: $number, metadata: $metadata}){
                            _id
                            number
                            customer
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            number: orderWithoutCustomer.number,
                            metadata: orderWithoutCustomer.metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(400)
                    .expect(res => {
                        const message = res.body.errors[0];
                        expect(message).toBeTruthy();
                    })
                    .end(done);
            });

            it('should fail ORDER CREATION when no Authorization token is provided', done => {
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveOrder ($number: String!, $customer: ID!, $metadata: [MetadataInput!]){
                            saveOrder (order: {number: $number, customer: $customer, metadata: $metadata}){
                            _id
                            number
                            customer {
                                _id
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            number: orderToBeCreated.number,
                            customer: orderToBeCreated.customer,
                            metadata: orderToBeCreated.metadata,
                        },
                    })
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toBe(MessageUtil.NO_TOKEN);
                    })
                    .end(done);
            });

            it('should pass when order is not created when customer is not valid or does not exist using graphql endpoing', done => {
                userInfo.permissions = [SCOPES.ORDER.saveOrder,];
                const token = TokenUtil.generateToken(userInfo);
                let _id = null;
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveOrder ($number: String!, $customer: ID!, $metadata: [MetadataInput!]){
                            saveOrder (order: {number: $number, customer: $customer, metadata: $metadata}){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            number: orderToBeCreated.number,
                            customer: new ObjectID(),
                            metadata: orderToBeCreated.metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { errors, } = res.body;
                        expect(errors).toBeTruthy();
                        expect(errors.length).toBeGreaterThan(0);
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Order.findOne({ _id, })
                            .then(order => {
                                if (order && order.length > 0) {
                                    done(err);
                                } else {
                                    done();
                                }
                            })
                            .catch(e => done(e));
                    });
            });
        });

        describe('- updateOrder resolver -', () => {
            beforeEach(populateOrderCustomer);
            it('should pass when an ORDER IS UPDATED by using the graphql endpoint - its number', done => {
                userInfo.permissions = [SCOPES.ORDER.updateOrder,];
                const token = TokenUtil.generateToken(userInfo);
                const number = 'UpdatedNumberOfOrder';
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateOrder ($id: ID!, $number: String){
                            updateOrder (_id: $id, number: $number){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: seedOrder[0]._id,
                            number,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateOrder, } = res.body.data;
                        expect(updateOrder).toBeTruthy();
                        expect(updateOrder.number).toBe(number);
                        expect(updateOrder.orderStatus).toBe(orderStatus.Pending);
                        expect(typeof updateOrder.customer).toBe('object');
                        expect(updateOrder.customer._id).toEqual(seedOrder[0].customer.toHexString());
                        expect(updateOrder.customer.orders).toBeTruthy();
                        expect(updateOrder.customer.orders.length).toBe(1);
                        expect(updateOrder.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                        expect(IdUtil(updateOrder.createdBy)).toEqual(TokenUtil.getUserId(token));
                        expect(ObjectID.isValid(updateOrder.updatedBy)).toBeTruthy();
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Order.findById(seedOrder[0]._id)
                            .then(order => {
                                expect(order).toBeTruthy();
                                expect(order.number).toBe(number);
                                expect(order.orderStatus).toBe(orderStatus.Pending);
                                expect(order.customer).toEqual(seedOrder[0].customer);
                                expect(order.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                                expect(IdUtil(order.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(ObjectID.isValid(order.updatedBy)).toBeTruthy();
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should pass when a ORDER IS UPDATED by using the graphql endpoint - its capcity and alertOnCapacity', done => {
                userInfo.permissions = [SCOPES.ORDER.updateOrder,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateOrder ($id: ID!){
                            updateOrder (_id: $id){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: seedOrder[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateOrder, } = res.body.data;
                        expect(updateOrder).toBeTruthy();
                        expect(updateOrder.number).toBe(seedOrder[0].number);
                        expect(updateOrder.orderStatus).toBe(orderStatus.Pending);
                        expect(typeof updateOrder.customer).toBe('object');
                        expect(updateOrder.customer._id).toEqual(seedOrder[0].customer.toHexString());
                        expect(updateOrder.customer.orders).toBeTruthy();
                        expect(updateOrder.customer.orders.length).toBe(1);
                        expect(updateOrder.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                        expect(IdUtil(updateOrder.createdBy)).toEqual(TokenUtil.getUserId(token));
                        expect(ObjectID.isValid(updateOrder.updatedBy)).toBeTruthy();
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Order.findById(seedOrder[0]._id)
                            .then(order => {
                                expect(order).toBeTruthy();
                                expect(order.number).toBe(seedOrder[0].number);
                                expect(order.orderStatus).toEqual(orderStatus.Pending);
                                expect(order.customer).toEqual(seedOrder[0].customer);
                                expect(order.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                                expect(IdUtil(order.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(ObjectID.isValid(order.updatedBy)).toBeTruthy();
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should pass when a ORDER IS UPDATED by using the graphql endpoint - everything', done => {
                userInfo.permissions = [SCOPES.ORDER.updateOrder,];
                const token = TokenUtil.generateToken(userInfo);
                const number = 'UpdateNumberOrder';
                const metadata = [{
                    key: 'Key1',
                    value: 'UPDATED Some Information about Key1',
                }, {
                    key: 'Key2',
                    value: 'UPDATED Some Information about Key2',
                },];
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateOrder ($id: ID!, $number: String, $metadata: [MetadataInput!]){
                            updateOrder (_id: $id, number: $number, metadata: $metadata){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: seedOrder[0]._id,
                            number,
                            metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateOrder, } = res.body.data;
                        expect(updateOrder).toBeTruthy();
                        expect(updateOrder.number).toBe(number);
                        expect(updateOrder.orderStatus).toBe(orderStatus.Pending);
                        expect(typeof updateOrder.customer).toBe('object');
                        expect(updateOrder.customer._id).toEqual(seedOrder[0].customer.toHexString());
                        expect(updateOrder.customer.orders).toBeTruthy();
                        expect(updateOrder.customer.orders.length).toBe(1);
                        expect(updateOrder.metadata).toEqual(expect.arrayContaining(metadata));
                        expect(IdUtil(updateOrder.createdBy)).toEqual(TokenUtil.getUserId(token));
                        expect(ObjectID.isValid(updateOrder.updatedBy)).toBeTruthy();
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Order.findById(seedOrder[0]._id)
                            .then(order => {
                                expect(order).toBeTruthy();
                                expect(order.number).toBe(number);
                                expect(order.orderStatus).toBe(orderStatus.Pending);
                                expect(order.customer).toEqual(seedOrder[0].customer);
                                expect(order.metadata).toEqual(expect.arrayContaining(metadata));
                                expect(IdUtil(order.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(ObjectID.isValid(order.updatedBy)).toBeTruthy();
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should fail when user has no right to update a ORDER by using the graphql endpoint', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                const number = 'UpdateOrderPlease';
                const metadata = [{
                    key: 'Key1',
                    value: 'UPDATED Some Information about Key1',
                }, {
                    key: 'Key2',
                    value: 'UPDATED Some Information about Key2',
                },];
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateOrder ($id: ID!, $number: String, $metadata: [MetadataInput!]){
                            updateOrder (_id: $id, number: $number, metadata: $metadata){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: seedOrder[0]._id,
                            number,
                            metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toBe(MessageUtil.ACCESS_DENIED);
                    })
                    .end(done);
            });

            it('should fail when no ORDER is found by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.ORDER.updateOrder,];
                const token = TokenUtil.generateToken(userInfo);
                const number = 'ORDER SHOULD BE UPDATED';
                const metadata = [{
                    key: 'Key1',
                    value: 'UPDATED Some Information about Key1',
                }, {
                    key: 'Key2',
                    value: 'UPDATED Some Information about Key2',
                },];
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateOrder ($id: ID!, $number: String, $metadata: [MetadataInput!]){
                            updateOrder (_id: $id, number: $number, metadata: $metadata){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: new ObjectID(),
                            number,
                            metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toContain(MessageUtil.MODEL_NOT_FOUND);
                    })
                    .end(done);
            });
        });

        describe('- deleteOrder resolver -', () => {
            beforeEach(populateOrderCustomer);
            it('should pass when order is deleted by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.ORDER.deleteOrder,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation deleteOrder ($id: ID!){
                            deleteOrder (_id: $id){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: seedOrder[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { deleteOrder, } = res.body.data;
                        expect(deleteOrder).toBeTruthy();
                        expect(deleteOrder.number).toBe(seedOrder[0].number);
                        expect(deleteOrder.orderStatus).toBe(orderStatus.Cancelled);
                        expect(typeof deleteOrder.customer).toBe('object');
                        expect(deleteOrder.customer._id).toEqual(seedOrder[0].customer.toHexString());
                        expect(deleteOrder.customer.orders).toBeTruthy();
                        expect(deleteOrder.customer.orders.length).toBe(1);
                        expect(deleteOrder.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                        expect(IdUtil(deleteOrder.createdBy)).toEqual(TokenUtil.getUserId(token));
                        expect(ObjectID.isValid(deleteOrder.updatedBy)).toBeTruthy();
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Order.findById(seedOrder[0]._id)
                            .then(order => {
                                expect(order).toBeTruthy();
                                expect(order.number).toBe(seedOrder[0].number);
                                expect(order.orderStatus).toBe(orderStatus.Cancelled);
                                expect(order.customer).toEqual(seedOrder[0].customer);
                                expect(order.metadata).toEqual(expect.arrayContaining(seedOrder[0].metadata));
                                expect(IdUtil(order.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(ObjectID.isValid(order.updatedBy)).toBeTruthy();
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should fail if order is not found to be deleted by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.ORDER.deleteOrder,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation deleteOrder ($id: ID!){
                            deleteOrder (_id: $id){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: new ObjectID(),
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toContain(MessageUtil.MODEL_NOT_FOUND);
                    })
                    .end(done);
            });

            it('should fail if user does not have the right to delete a order by using the graphql endpoint', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation deleteOrder ($id: ID!){
                            deleteOrder (_id: $id){
                            _id
                            number
                            customer {
                                _id
                                name
                                orders {
                                    _id
                                }
                            }
                            orderStatus
                            metadata {
                                key
                                value
                            }
                            createdBy
                            updatedBy
                        }
                        }`, variables: {
                            id: seedOrder[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.errors).toBeTruthy();
                        expect(res.body.errors.length).toBe(1);
                        expect(res.body.errors[0].errorCode).toContain(MessageUtil.ACCESS_DENIED);
                    })
                    .end(done);
            });
        });
    });
});