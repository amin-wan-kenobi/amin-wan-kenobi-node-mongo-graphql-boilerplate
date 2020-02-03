import expect from 'expect';
import Customer from '../../models/customer';
import Order from '../../models/order';

import {
    populateCustomer,
    populateOrder,
    populateOrderCustomer,
} from './seed-factory';

describe('---------------------- Seeds ----------------------', () => {
    describe('-- Customer Seed --', () => {
        beforeEach(populateCustomer);
        it('should test Customer collection', done => {
            Customer.find()
                .then(customers => {
                    expect(customers).toBeTruthy();
                    expect(customers.length).toBe(1);
                    done();
                });
        });
    });

    describe('-- Order Seed --', () => {
        beforeEach(populateOrder);
        it('should test Order collection', done => {
            Order.find()
                .then(orders => {
                    expect(orders).toBeTruthy();
                    expect(orders.length).toBe(2);
                    done();
                });
        });
    });

    describe('-- Customer & Order Seed --', () => {
        beforeEach(populateOrderCustomer);
        it('should test Customer & Orders collections', done => {
            let customers = [];
            let orders = [];
            Customer.find()
                .then(customersFromDB => {
                    customers = customersFromDB;
                    return Order.find();
                })
                .then(ordersFromDB => {
                    orders = ordersFromDB;
                    expect(customers).toBeTruthy();
                    expect(customers[0].orders).toBeTruthy();
                    expect([orders[0]._id, orders[1]._id,]).toEqual(expect.arrayContaining(customers[0].orders));


                    expect(orders).toBeTruthy();
                    expect(orders[0].customer).toBeTruthy();
                    expect(orders[0].customer.toString()).toBe(customers[0]._id.toString());

                    done();
                })
                .catch(e => done(e));
        });
    });
});
