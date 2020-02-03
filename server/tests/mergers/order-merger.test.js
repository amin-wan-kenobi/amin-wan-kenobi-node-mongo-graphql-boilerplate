import expect from 'expect';
import { singleOrder, manyOrders, } from '../../graphql/mergers/order.merger';
import { seedCustomer, } from '../seeds/customer-seed';
import { seedOrder, } from '../seeds/order-seed';
import { populateOrderCustomer, } from '../seeds/seed-factory';

describe('---------------------- Order Merger ----------------------', () => {
    beforeEach(populateOrderCustomer);
    it('should test the singleOrder function', done => {
        singleOrder(seedOrder[0]._id)
            .then(order => {
                expect(order).toBeTruthy();
                expect(order.name).toBe(seedOrder[0].name);
                expect(typeof order.customer).toBe('function');
                return order.customer();
            })
            .then(customer => {
                expect(customer).toBeTruthy();
                expect(customer.name).toBe(seedCustomer[0].name);
                expect(typeof customer.orders).toBe('function');
                done();
            });
    });

    it('should test the manyOrders function', done => {
        let myOrders = null;
        manyOrders([seedOrder[0]._id, seedOrder[1]._id,])
            .then(orders => {
                myOrders = orders;
                expect(orders).toBeTruthy();
                expect(orders[0].name).toBe(seedOrder[0].name);
                expect(typeof orders[0].customer).toBe('function');
                return orders[0].customer();
            })
            .then(customer => {
                expect(customer).toBeTruthy();
                expect(customer.name).toBe(seedCustomer[0].name);
                expect(typeof customer.orders).toBe('function');
                return myOrders[1].customer();
            })
            .then(customer => {
                expect(customer).toBeTruthy();
                expect(customer.name).toBe(seedCustomer[0].name);
                expect(typeof customer.orders).toBe('function');
                done();
            });
    });
    it('should test the failure of singleOrder function', done => {
        singleOrder()
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                return singleOrder(null);
            })
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                return singleOrder('123');
            })
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                done();
            });
    });
    it('should test the failure of manyOrders function', done => {
        manyOrders()
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                return manyOrders([null,]);
            })
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                done();
            });
    });
});