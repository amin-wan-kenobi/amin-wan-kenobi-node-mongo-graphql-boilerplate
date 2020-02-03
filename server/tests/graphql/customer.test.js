import expect from 'expect';
import { ObjectID, } from 'mongodb';
import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList, GraphQLObjectType, } from 'graphql';
import request from 'supertest';

import { app, } from '../../server';
import Customer from '../../models/customer';
import allSchemas from '../../graphql/schema';
import customerResolver from '../../graphql/resolver/customer';
import { seedCustomer, } from '../seeds/customer-seed';
import { seedOrder, } from '../seeds/order-seed';
import { populateOrderCustomer, } from '../seeds/seed-factory';
import TokenUtil from '../../helpers/token-util';
import MessageUtil from '../../helpers/message-util';
import IdUtil from '../../helpers/id-util';
import SCOPES from '../../permissions/permissions-scope-constants';
import status from '../../constants/status';

describe('---------------------- Customer ----------------------', () => {
    const customer = allSchemas.getType('Customer').toConfig();
    const CustomerInput = allSchemas.getType('CustomerInput').toConfig();

    const URL = '/graphql';

    const customerToBeCreated = {
        name: 'Christopher Pike',
        coordinates: {
            longitude: '-73.6154157',
            latitude: '45.5267912',
        },
        orders: [seedOrder[0]._id,],
        createdBy: seedCustomer[0].createdBy,
        metadata: [{
            key: 'Key1',
            value: 'Value to Key1',
        },],
    };

    describe('-- CustomerType Schema --', () => {
        it('should pass when all the existing types are in the Customer Schema', () => {
            expect(customer).toBeTruthy();

            expect(Object.keys(customer.fields).length).toBe(8);

            expect(customer.fields).toHaveProperty('_id');
            expect(customer.fields._id.type).toEqual(GraphQLNonNull(GraphQLID));

            expect(customer.fields).toHaveProperty('name');
            expect(customer.fields.name.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(customer.fields).toHaveProperty('coordinates');
            expect(customer.fields.coordinates.type.toString()).toBe(new GraphQLObjectType({ name: 'Coordinates', }).toString());

            expect(customer.fields).toHaveProperty('orders');
            expect(customer.fields.orders.type.toString()).toEqual(GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'Order', })))).toString());

            expect(customer.fields).toHaveProperty('status');
            expect(customer.fields.status.type.toString()).toEqual(GraphQLNonNull(new GraphQLObjectType({ name: 'ModelStatus', })).toString());

            expect(customer.fields).toHaveProperty('metadata');
            expect(customer.fields.metadata.type.toString()).toEqual(GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'Metadata', })))).toString());

            expect(customer.fields).toHaveProperty('createdBy');
            expect(customer.fields.createdBy.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(customer.fields).toHaveProperty('updatedBy');
            expect(customer.fields.updatedBy.type).toEqual(GraphQLString);
        });

        it('should pass when CustomerInput is present', () => {
            expect(CustomerInput).toBeTruthy();

            expect(Object.keys(CustomerInput.fields).length).toBe(4);

            expect(CustomerInput.fields).toHaveProperty('name');
            expect(CustomerInput.fields.name.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(CustomerInput.fields).toHaveProperty('coordinates');
            expect(CustomerInput.fields.coordinates.type.toString()).toBe(new GraphQLObjectType({ name: 'CoordinatesInput', }).toString());

            expect(CustomerInput.fields).toHaveProperty('metadata');
            expect(CustomerInput.fields.metadata.type.toString()).toEqual(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'MetadataInput', }))).toString());

        });
    });

    describe('-- Customer Resolvers --', () => {
        beforeEach(populateOrderCustomer);
        it('should pass when customer resolver returns a LIST OF CUSTOMERS', done => {
            customerResolver.customers()
                .then(customersFromDB => {
                    expect(customersFromDB.length).toBe(1);
                    expect(customersFromDB[0]._id).toEqual(seedCustomer[0]._id.toHexString());
                    expect(customersFromDB[0].name).toBe(seedCustomer[0].name);
                    expect(customersFromDB[0].coordinates).toEqual(seedCustomer[0].coordinates);
                    expect(customersFromDB[0].status).toEqual(status.Active);
                    expect(typeof customersFromDB[0].orders).toBe('function');
                    expect(customersFromDB[0].createdBy).toEqual(seedCustomer[0].createdBy);
                    expect(customersFromDB[0].metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when saveCustomer resolver CREATES AN CUSTOMER', done => {
            customerResolver.saveCustomer({ customer: customerToBeCreated, })
                .then(savedCustomer => {
                    expect(savedCustomer).toBeTruthy();
                    expect(savedCustomer._id).toBeTruthy();
                    expect(savedCustomer.name).toBe(customerToBeCreated.name);
                    expect(savedCustomer.coordinates).toEqual(customerToBeCreated.coordinates);
                    expect(savedCustomer.status).toEqual(status.Active);
                    expect(typeof savedCustomer.orders).toBe('function');
                    expect(savedCustomer.metadata).toEqual(expect.arrayContaining(customerToBeCreated.metadata));
                    expect(savedCustomer.createdBy).toEqual(customerToBeCreated.createdBy);
                    return Customer.findOne({ name: customerToBeCreated.name, });
                })
                .then(customer => {
                    expect(customer).toBeTruthy();
                    expect(customer.name).toBe(customerToBeCreated.name);
                    expect(customer.coordinates).toMatchObject(customerToBeCreated.coordinates);
                    expect(customer.status).toEqual(status.Active);
                    expect(customer.orders.toString()).toEqual(customerToBeCreated.orders.toString());
                    expect(customer.metadata).toEqual(expect.arrayContaining(customerToBeCreated.metadata));
                    expect(customer.createdBy).toEqual(customerToBeCreated.createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when updateCustomer resolver UPDATES A CUSTOMER - its name', done => {
            const name = 'Updated Exisiting Customer';
            customerResolver.updateCustomer({ _id: seedCustomer[0]._id, name, })
                .then(updatedCustomer => {
                    expect(updatedCustomer._id).toEqual(seedCustomer[0]._id.toHexString());
                    expect(updatedCustomer.name).toBe(name);
                    expect(updatedCustomer.coordinates).toEqual(seedCustomer[0].coordinates);
                    expect(typeof updatedCustomer.orders).toBe('function');
                    expect(updatedCustomer.status).toEqual(status.Active);
                    expect(updatedCustomer.createdBy).toEqual(seedCustomer[0].createdBy);
                    expect(updatedCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    return Customer.findById(seedCustomer[0]._id);
                })
                .then(customer => {
                    expect(customer).toBeTruthy();
                    expect(customer.name).toBe(name);
                    expect(customer.coordinates).toMatchObject(seedCustomer[0].coordinates);
                    expect(customer.orders.toString()).toEqual(seedCustomer[0].orders.toString());
                    expect(customer.status).toEqual(status.Active);
                    expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    expect(customer.createdBy).toEqual(seedCustomer[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when updateCustomer resolver UPDATES A CUSTOMER - its coordinates', done => {
            const coordinates = {
                longitude: '-55.123456',
                latitude: '22.987654',
            };
            customerResolver.updateCustomer({ _id: seedCustomer[0]._id, coordinates, })
                .then(updatedCustomer => {
                    expect(updatedCustomer._id).toEqual(seedCustomer[0]._id.toHexString());
                    expect(updatedCustomer.name).toBe(seedCustomer[0].name);
                    expect(updatedCustomer.coordinates).toEqual(coordinates);
                    expect(updatedCustomer.status).toEqual(status.Active);
                    expect(typeof updatedCustomer.orders).toBe('function');
                    expect(updatedCustomer.createdBy).toEqual(seedCustomer[0].createdBy);
                    expect(updatedCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    return Customer.findById(seedCustomer[0]._id);
                })
                .then(customer => {
                    expect(customer).toBeTruthy();
                    expect(customer.name).toBe(seedCustomer[0].name);
                    expect(customer.coordinates).toMatchObject(coordinates);
                    expect(customer.status).toEqual(status.Active);
                    expect(customer.orders.toString()).toEqual(seedCustomer[0].orders.toString());
                    expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    expect(customer.createdBy).toEqual(seedCustomer[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when updateCustomer resolver UPDATES A CUSTOMER - everything', done => {
            const name = 'Updated Exisiting Customer';
            const coordinates = {
                longitude: '-55.123456',
                latitude: '22.987654',
            };
            const metadata = [{
                key: 'Key1',
                value: 'UPDATED Some Information about Key1',
            }, {
                key: 'Key2',
                value: 'UPDATED Some Information about Key2',
            },];
            const orders = [seedCustomer[0].orders[0], seedOrder[1]._id,];
            customerResolver.updateCustomer({ _id: seedCustomer[0]._id, name, coordinates, orders, metadata, })
                .then(updatedCustomer => {
                    expect(updatedCustomer._id).toEqual(seedCustomer[0]._id.toHexString());
                    expect(updatedCustomer.name).toBe(name);
                    expect(updatedCustomer.coordinates).toEqual(coordinates);
                    expect(updatedCustomer.status).toEqual(status.Active);
                    expect(typeof updatedCustomer.orders).toBe('function');
                    expect(updatedCustomer.createdBy).toEqual(seedCustomer[0].createdBy);
                    expect(updatedCustomer.metadata).toEqual(expect.arrayContaining(metadata));
                    return Customer.findById(seedCustomer[0]._id);
                })
                .then(customer => {
                    expect(customer).toBeTruthy();
                    expect(customer.name).toBe(name);
                    expect(customer.coordinates).toMatchObject(coordinates);
                    expect(customer.status).toEqual(status.Active);
                    expect(customer.orders.toString()).toEqual(orders.toString());
                    expect(customer.metadata).toEqual(expect.arrayContaining(metadata));
                    expect(customer.createdBy).toEqual(seedCustomer[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should pass when getCustomerById returns A CUSTOMER', done => {
            customerResolver.getCustomerById({ id: seedCustomer[0]._id, })
                .then(customersFromDB => {
                    expect(customersFromDB._id).toEqual(seedCustomer[0]._id.toHexString());
                    expect(customersFromDB.name).toBe(seedCustomer[0].name);
                    expect(customersFromDB.coordinates).toEqual(seedCustomer[0].coordinates);
                    expect(customersFromDB.status).toEqual(status.Active);
                    expect(typeof customersFromDB.orders).toBe('function');
                    expect(customersFromDB.createdBy).toEqual(seedCustomer[0].createdBy);
                    expect(customersFromDB.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    done();
                })
                .catch(e => done(e));
        });

        it('should fail when getCustomerById does not receive any id', done => {
            customerResolver.getCustomerById()
                .then(customersFromDB => {
                    done(customersFromDB);
                })
                .catch(e => done());
        });

        it('should fail when getCustomerById receives an id but it is not ObjectID', done => {
            customerResolver.getCustomerById({ id: '12345', })
                .then(customersFromDB => {
                    done(customersFromDB);
                })
                .catch(e => done());
        });

        it('should pass when deleteCustomer resolver DELETES A CUSTOMER', done => {
            customerResolver.deleteCustomer({ _id: seedCustomer[0]._id, })
                .then(deletedCustomer => {
                    expect(deletedCustomer._id).toEqual(seedCustomer[0]._id.toHexString());
                    expect(deletedCustomer.name).toBe(seedCustomer[0].name);
                    expect(deletedCustomer.coordinates).toEqual(seedCustomer[0].coordinates);
                    expect(deletedCustomer.status).toEqual(status.Inactive);
                    expect(typeof deletedCustomer.orders).toBe('function');
                    expect(deletedCustomer.createdBy).toEqual(seedCustomer[0].createdBy);
                    expect(deletedCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    return Customer.findById(seedCustomer[0]._id);
                })
                .then(customer => {
                    expect(customer).toBeTruthy();
                    expect(customer.name).toBe(seedCustomer[0].name);
                    expect(customer.coordinates).toMatchObject(seedCustomer[0].coordinates);
                    expect(customer.status).toEqual(status.Inactive);
                    expect(customer.orders.toString()).toEqual(seedCustomer[0].orders.toString());
                    expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                    expect(customer.createdBy).toEqual(seedCustomer[0].createdBy);
                    done();
                })
                .catch(e => done(e));
        });

        it('should fail when deleteCustomer receives an id but it is not ObjectID', done => {
            customerResolver.deleteCustomer({ _id: '12345', })
                .then(deletedCustomer => {
                    done(deletedCustomer);
                })
                .catch(e => done());
        });
    });

    describe('-- Customer GraphQL Endpoint --', () => {
        beforeEach(populateOrderCustomer);
        const userInfo = {
            user: {
                _id: seedCustomer[0].createdBy,
            },
            permissions: [],
        };

        describe('- customers resolver -', () => {
            it('should pass when a list of customers are returned by using the graphql endpoint. Also checks the orders of the customer and checks the customer of the orders', done => {
                userInfo.permissions = [SCOPES.CUSTOMER.customers,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query {
                        customers {
                            _id
                            name
                            coordinates {
                                longitude
                                latitude
                            }
                            orders {
                                _id
                                number
                                customer {
                                    _id
                                    name
                                }
                            }
                            status
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
                        const { customers, } = res.body.data;
                        expect(customers).toBeTruthy();
                        expect(customers[0]._id.toString()).toEqual(seedCustomer[0]._id.toHexString());
                        expect(customers[0].name).toBe(seedCustomer[0].name);
                        expect(customers[0].coordinates).toEqual(seedCustomer[0].coordinates);
                        expect(customers[0].status).toEqual(status.Active);
                        expect(customers[0].orders[0]._id.toString()).toBe(seedCustomer[0].orders.toString());
                        expect(customers[0].metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                        expect(customers[0].createdBy.toString()).toBe(seedCustomer[0].createdBy.toString());
                        expect(customers[0].orders[0].customer._id.toString()).toBe(seedCustomer[0]._id.toHexString());
                        expect(customers[0].orders[0].customer.name).toBe(seedCustomer[0].name);
                    })
                    .end(done);
            });

            it('should fail when user does not have permission to use the customers function', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query {
                        customers {
                            _id
                            name
                            coordinates {
                                longitude
                                latitude
                            }
                            orders {
                                _id
                                number
                                customer {
                                    _id
                                    name
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

        describe('- getCustomerById resolver -', () => {
            it('should pass when an customer is returned for getCustomerById by using the graphql endpoint. Also checks the orders of the custoemr and checks the customer of the order', done => {
                userInfo.permissions = [SCOPES.CUSTOMER.getCustomerById,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getCustomerById ($id: ID!) {
                                    getCustomerById (id: $id) {
                                        _id
                                        name
                                        coordinates {
                                            longitude
                                            latitude
                                        }
                                        orders {
                                            _id
                                            number
                                            customer {
                                                _id
                                                name
                                            }
                                        }
                                        status
                                        metadata {
                                            key
                                            value
                                        }
                                        createdBy
                                    }
                                }`, variables: {
                            id: seedCustomer[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { getCustomerById, } = res.body.data;
                        expect(getCustomerById).toBeTruthy();
                        expect(getCustomerById._id.toString()).toEqual(seedCustomer[0]._id.toHexString());
                        expect(getCustomerById.name).toBe(seedCustomer[0].name);
                        expect(getCustomerById.coordinates).toEqual(seedCustomer[0].coordinates);
                        expect(getCustomerById.status).toEqual(status.Active);
                        expect(getCustomerById.orders[0]._id.toString()).toBe(seedCustomer[0].orders.toString());
                        expect(getCustomerById.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                        expect(getCustomerById.createdBy.toString()).toBe(seedCustomer[0].createdBy.toString());
                        expect(getCustomerById.orders[0].customer._id.toString()).toBe(seedCustomer[0]._id.toHexString());
                        expect(getCustomerById.orders[0].customer.name).toBe(seedCustomer[0].name);
                    })
                    .end(done);
            });

            it('should fail when user does not have permission to use the getCustomerById function', done => {
                //Why is it 200 and the other one is 500?
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getCustomerById ($id: ID!) {
                                    getCustomerById (id: $id) {
                                        _id
                                        name
                                        coordinates {
                                            longitude
                                            latitude
                                        }
                                        orders {
                                            _id
                                            number
                                            customer {
                                                _id
                                                name
                                            }
                                        }
                                        metadata {
                                            key
                                            value
                                        }
                                        createdBy
                                    }
                                }`, variables: {
                            id: seedCustomer[0]._id,
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

            it('should fail when no id is passed to getCustomerById by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.CUSTOMER.getCustomerById,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getCustomerById ($id: ID!) {
                                    getCustomerById (id: $id) {
                                        _id
                                        name
                                        coordinates {
                                            longitude
                                            latitude
                                        }
                                        orders {
                                            _id
                                            number
                                            customer {
                                                _id
                                                name
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

            it('should fail when passed id to getCustomerById is not ObjectID by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.CUSTOMER.getCustomerById,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `query getCustomerById ($id: ID!) {
                                    getCustomerById (id: $id) {
                                        _id
                                        name
                                        coordinates {
                                            longitude
                                            latitude
                                        }
                                        orders {
                                            _id
                                            number
                                            customer {
                                                _id
                                                name
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

        describe('- saveCustomer resolver -', () => {
            it('should fail creation of a customer when no name is provided', done => {
                let customerWithoutname = Object.assign({}, customerToBeCreated);
                delete customerWithoutname.name;
                userInfo.permissions = [SCOPES.CUSTOMER.saveCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveCustomer ($coordinates: CoordinatesInput!, $orders: OrderInput!, $metadata: MetadataInput){
                            saveCustomer (customer: {coordinates: $coordinates, orders: $orders, metadata: $metadata}){
                            _id
                            name
                            coordinates {
                                longitude
                                latitude
                            }
                            orders {
                                _id
                                number
                            }
                            metadata {
                                key
                                value
                            }
                            createdBy
                        }
                        }`, variables: {
                            coordinates: customerToBeCreated.coordinates,
                            orders: customerToBeCreated.orders,
                            metadata: customerToBeCreated.metadata,
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

            it('should pass when a new customer is created by using the graphql endpoint', done => {
                let _id = null;
                userInfo.permissions = [SCOPES.CUSTOMER.saveCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveCustomer ($name: String!, $coordinates: CoordinatesInput!, $orders: [ID!], $metadata: [MetadataInput!]){
                            saveCustomer (customer: {name: $name, coordinates: $coordinates, orders: $orders, metadata: $metadata}){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                status
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            name: customerToBeCreated.name,
                            coordinates: customerToBeCreated.coordinates,
                            orders: customerToBeCreated.orders,
                            metadata: customerToBeCreated.metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { saveCustomer, } = res.body.data;
                        expect(saveCustomer).toBeTruthy();
                        expect(saveCustomer._id).toBeTruthy();
                        _id = saveCustomer._id;
                        expect(saveCustomer.name).toBe(customerToBeCreated.name);
                        expect(saveCustomer.coordinates).toEqual(customerToBeCreated.coordinates);
                        expect(saveCustomer.status).toEqual(status.Active);
                        expect(saveCustomer.orders.length).toBe(1);
                        expect(saveCustomer.orders[0]._id.toString()).toBe(customerToBeCreated.orders[0].toString());
                        expect(saveCustomer.metadata).toEqual(expect.arrayContaining(customerToBeCreated.metadata));
                        expect(IdUtil(saveCustomer.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Customer.findOne({ _id, })
                            .then(customer => {
                                expect(customer).toBeTruthy();
                                expect(customer.name).toBe(customerToBeCreated.name);
                                expect(customer.coordinates).toMatchObject(customerToBeCreated.coordinates);
                                expect(customer.status).toEqual(status.Active);
                                expect(customer.orders.toString()).toEqual(customerToBeCreated.orders.toString());
                                expect(customer.metadata).toEqual(expect.arrayContaining(customerToBeCreated.metadata));
                                expect(IdUtil(customer.createdBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));

                    });
            });

            it('should fail CUSTOMER CREATION when no Authorization token is provided', done => {
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation saveCustomer ($name: String! $coordinates: CoordinatesInput!, $orders: [ID!], $metadata: [MetadataInput!]){
                            saveCustomer (customer: {name: $name, coordinates: $coordinates, orders: $orders, metadata: $metadata}){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            name: customerToBeCreated.name,
                            coordinates: customerToBeCreated.coordinates,
                            orders: customerToBeCreated.orders,
                            metadata: customerToBeCreated.metadata,
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
        });
        describe('- updateCustomer resolver -', () => {
            it('should pass when customer is updated by using the graphql endpoint - its name', done => {
                const name = 'Update Customer Name';
                userInfo.permissions = [SCOPES.CUSTOMER.updateCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateCustomer ($_id: ID!, $name: String){
                            updateCustomer (_id: $_id, name: $name){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                status
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: seedCustomer[0]._id,
                            name,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateCustomer, } = res.body.data;
                        expect(updateCustomer).toBeTruthy();
                        expect(updateCustomer._id).toBeTruthy();
                        expect(updateCustomer.name).toBe(name);
                        expect(updateCustomer.coordinates).toEqual(seedCustomer[0].coordinates);
                        expect(updateCustomer.status).toEqual(status.Active);
                        expect(updateCustomer.orders.length).toBe(1);
                        expect(updateCustomer.orders[0]._id.toString()).toBe(seedCustomer[0].orders[0].toString());
                        expect(updateCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                        expect(IdUtil(updateCustomer.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Customer.findById(seedCustomer[0]._id)
                            .then(customer => {
                                expect(customer).toBeTruthy();
                                expect(customer.name).toBe(name);
                                expect(customer.coordinates).toMatchObject(seedCustomer[0].coordinates);
                                expect(customer.status).toEqual(status.Active);
                                expect(customer.orders.toString()).toEqual(seedCustomer[0].orders.toString());
                                expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                                expect(IdUtil(customer.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(IdUtil(customer.updatedBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should pass when customer is updated by using the graphql endpoint - its coordinates', done => {
                const coordinates = {
                    longitude: '-55.00998877',
                    latitude: '88.11223344',
                };
                userInfo.permissions = [SCOPES.CUSTOMER.updateCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateCustomer ($_id: ID!, $coordinates: CoordinatesInput){
                            updateCustomer (_id: $_id, coordinates: $coordinates){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: seedCustomer[0]._id,
                            coordinates,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateCustomer, } = res.body.data;
                        expect(updateCustomer).toBeTruthy();
                        expect(updateCustomer._id).toBeTruthy();
                        expect(updateCustomer.name).toBe(seedCustomer[0].name);
                        expect(updateCustomer.coordinates).toEqual(coordinates);
                        expect(updateCustomer.orders.length).toBe(1);
                        expect(updateCustomer.orders[0]._id.toString()).toBe(seedCustomer[0].orders[0].toString());
                        expect(updateCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                        expect(IdUtil(updateCustomer.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Customer.findById(seedCustomer[0]._id)
                            .then(customer => {
                                expect(customer).toBeTruthy();
                                expect(customer.name).toBe(seedCustomer[0].name);
                                expect(customer.coordinates).toMatchObject(coordinates);
                                expect(customer.orders.toString()).toEqual(seedCustomer[0].orders.toString());
                                expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                                expect(IdUtil(customer.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(IdUtil(customer.updatedBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should pass when customer is updated by using the graphql endpoint - its orders', done => {
                const orders = [seedCustomer[0].orders[0], seedOrder[1]._id,];
                userInfo.permissions = [SCOPES.CUSTOMER.updateCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateCustomer ($_id: ID!, $orders: [ID!]){
                            updateCustomer (_id: $_id, orders: $orders){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: seedCustomer[0]._id,
                            orders,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateCustomer, } = res.body.data;
                        expect(updateCustomer).toBeTruthy();
                        expect(updateCustomer._id).toBeTruthy();
                        expect(updateCustomer.name).toBe(seedCustomer[0].name);
                        expect(updateCustomer.coordinates).toEqual(seedCustomer[0].coordinates);
                        expect(updateCustomer.orders.length).toBe(2);
                        expect(updateCustomer.orders[0]._id.toString()).toBe(orders[0].toString());
                        expect(updateCustomer.orders[1]._id.toString()).toBe(orders[1].toString());
                        expect(updateCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                        expect(IdUtil(updateCustomer.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Customer.findById(seedCustomer[0]._id)
                            .then(customer => {
                                expect(customer).toBeTruthy();
                                expect(customer.name).toBe(seedCustomer[0].name);
                                expect(customer.coordinates).toMatchObject(seedCustomer[0].coordinates);
                                expect(customer.orders.toString()).toEqual(orders.toString());
                                expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                                expect(IdUtil(customer.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(IdUtil(customer.updatedBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should pass when customer is updated by using the graphql endpoint - everything', done => {
                const name = 'Update Customer Name';
                const coordinates = {
                    longitude: '-55.00998877',
                    latitude: '88.11223344',
                };
                const metadata = [{
                    key: 'WHATEVER',
                    value: 'WHATEVER VALUE',
                },];
                const orders = [seedCustomer[0].orders[0], seedOrder[1]._id,];
                userInfo.permissions = [SCOPES.CUSTOMER.updateCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateCustomer ($_id: ID!, $orders: [ID!], $name: String, $coordinates: CoordinatesInput, $metadata: [MetadataInput!]){
                            updateCustomer (_id: $_id, orders: $orders, name: $name, coordinates: $coordinates, metadata: $metadata){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                status
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: seedCustomer[0]._id,
                            name,
                            coordinates,
                            orders,
                            metadata,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { updateCustomer, } = res.body.data;
                        expect(updateCustomer).toBeTruthy();
                        expect(updateCustomer.name).toBe(name);
                        expect(updateCustomer.coordinates).toEqual(coordinates);
                        expect(updateCustomer.status).toEqual(status.Active);
                        expect(updateCustomer.orders.length).toBe(2);
                        expect(updateCustomer.orders[0]._id.toString()).toBe(orders[0].toString());
                        expect(updateCustomer.orders[1]._id.toString()).toBe(orders[1].toString());
                        expect(updateCustomer.metadata).toEqual(expect.arrayContaining(metadata));
                        expect(IdUtil(updateCustomer.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Customer.findById(seedCustomer[0]._id)
                            .then(customer => {
                                expect(customer).toBeTruthy();
                                expect(customer.name).toBe(name);
                                expect(customer.coordinates).toMatchObject(coordinates);
                                expect(customer.status).toEqual(status.Active);
                                expect(customer.orders.toString()).toEqual(orders.toString());
                                expect(customer.metadata).toEqual(expect.arrayContaining(metadata));
                                expect(IdUtil(customer.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(IdUtil(customer.updatedBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should fail if user has no right to update a customer by using the graphql endpoint', done => {
                const name = 'Update Customer Name';
                const coordinates = {
                    longitude: '-55.00998877',
                    latitude: '88.11223344',
                };
                const metadata = [{
                    key: 'WHATEVER',
                    value: 'WHATEVER VALUE',
                },];
                const orders = [seedCustomer[0].orders[0], seedOrder[1]._id,];
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateCustomer ($_id: ID!, $orders: [ID!], $name: String, $coordinates: CoordinatesInput, $metadata: [MetadataInput!]){
                            updateCustomer (_id: $_id, orders: $orders, name: $name, coordinates: $coordinates, metadata: $metadata){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: seedCustomer[0]._id,
                            name,
                            coordinates,
                            orders,
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

            it('should fail if no customer is found by using the graphql endpoint', done => {
                const name = 'Update Customer Name';
                const coordinates = {
                    longitude: '-55.00998877',
                    latitude: '88.11223344',
                };
                const metadata = [{
                    key: 'WHATEVER',
                    value: 'WHATEVER VALUE',
                },];
                const orders = [seedCustomer[0].orders[0], seedOrder[1]._id,];
                userInfo.permissions = [SCOPES.CUSTOMER.updateCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation updateCustomer ($_id: ID!, $orders: [ID!], $name: String, $coordinates: CoordinatesInput, $metadata: [MetadataInput!]){
                            updateCustomer (_id: $_id, orders: $orders, name: $name, coordinates: $coordinates, metadata: $metadata){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: new ObjectID(),
                            name,
                            coordinates,
                            orders,
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

        describe('- deleteCustomer resolver -', () => {
            beforeEach(populateOrderCustomer);
            it('should pass when customer is deleted by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.CUSTOMER.deleteCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation deleteCustomer ($_id: ID!){
                            deleteCustomer (_id: $_id){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                status
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: seedCustomer[0]._id,
                        },
                    })
                    .set('Authorization', `Basic ${token}`)
                    .expect(200)
                    .expect((res) => {
                        const { deleteCustomer, } = res.body.data;
                        expect(deleteCustomer).toBeTruthy();
                        expect(deleteCustomer.name).toBe(seedCustomer[0].name);
                        expect(deleteCustomer.coordinates).toEqual(seedCustomer[0].coordinates);
                        expect(deleteCustomer.status).toEqual(status.Inactive);
                        expect(deleteCustomer.orders.length).toBe(1);
                        expect(deleteCustomer.orders[0]._id.toString()).toBe(seedCustomer[0].orders[0].toString());
                        expect(deleteCustomer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                        expect(IdUtil(deleteCustomer.createdBy)).toEqual(TokenUtil.getUserId(token));
                    })
                    .end(err => {
                        if (err) {
                            return done(err);
                        }
                        Customer.findById(seedCustomer[0]._id)
                            .then(customer => {
                                expect(customer).toBeTruthy();
                                expect(customer.name).toBe(seedCustomer[0].name);
                                expect(customer.coordinates).toMatchObject(seedCustomer[0].coordinates);
                                expect(customer.status).toEqual(status.Inactive);
                                expect(customer.orders.toString()).toEqual(seedCustomer[0].orders.toString());
                                expect(customer.metadata).toEqual(expect.arrayContaining(seedCustomer[0].metadata));
                                expect(IdUtil(customer.createdBy)).toEqual(TokenUtil.getUserId(token));
                                expect(IdUtil(customer.updatedBy)).toEqual(TokenUtil.getUserId(token));
                                done();
                            })
                            .catch(e => done(e));
                    });
            });

            it('should fail if no customer is found to be deleted by using the graphql endpoint', done => {
                userInfo.permissions = [SCOPES.CUSTOMER.deleteCustomer,];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation deleteCustomer ($_id: ID!){
                            deleteCustomer (_id: $_id){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: new ObjectID(),
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

            it('should fail if user has no right to deleteCustomer is found by using the graphql endpoint', done => {
                userInfo.permissions = [];
                const token = TokenUtil.generateToken(userInfo);
                request(app)
                    .post(URL)
                    .send({
                        query: `mutation deleteCustomer ($_id: ID!){
                            deleteCustomer (_id: $_id){
                                _id
                                name
                                coordinates {
                                    longitude
                                    latitude
                                }
                                orders {
                                    _id
                                }
                                metadata {
                                    key
                                    value
                                }
                                createdBy
                            }
                        }`,
                        variables: {
                            _id: new ObjectID(),
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
        });
    });
});