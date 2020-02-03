import expect from 'expect';
import { singleCustomer, } from '../../graphql/mergers/customer.merger';
import { seedCustomer, } from '../seeds/customer-seed';
import { seedOrder, } from '../seeds/order-seed';
import { populateOrderCustomer, } from '../seeds/seed-factory';

describe('---------------------- Customer Merger ----------------------', () => {
    beforeEach(populateOrderCustomer);
    it('should test the singleCustomer function', done => {
        singleCustomer(seedCustomer[0]._id)
            .then(customer => {
                expect(customer).toBeTruthy();
                expect(customer.name).toBe(seedCustomer[0].name);
                expect(typeof customer.orders).toBe('function');
                return customer.orders();
            })
            .then(orders => {
                expect(orders).toBeTruthy();
                expect(orders[0].name).toBe(seedOrder[0].name);
                expect(typeof orders[0].customer).toBe('function');
                return orders[0].customer();
            })
            .then(customer => {
                expect(customer).toBeTruthy();
                expect(customer.name).toBe(seedCustomer[0].name);
                expect(typeof customer.orders).toBe('function');
                done();
            });
    });
    it('should test the failure of singleCustomer function', done => {
        singleCustomer()
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                return singleCustomer(null);
            })
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                return singleCustomer('123');
            })
            .then()
            .catch(e => {
                expect(e).toBeTruthy();
                done();
            });
    });
});