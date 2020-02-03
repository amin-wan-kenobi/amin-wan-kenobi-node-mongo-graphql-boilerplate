import Dataloader from 'dataloader';
import Customer from '../../models/customer';

import convertor from '../../helpers/doc-model-convertor';
import { manyOrders, } from './order.merger';


const customerLoader = new Dataloader(customerId => findCustomers(customerId), { batch: false, });

const findCustomers = async customerId => {
    try {
        const customers = await Customer.find({ _id: { $in: customerId, }, });
        return customers.map(customer => customerTransform(customer));
    } catch (e) {
        throw e;
    }
};

export const singleCustomer = async customerId => {
    try {
        const customer = await customerLoader.load(customerId);
        return customer;
    } catch (e) {
        throw e;
    }
};

export const customerTransform = customer => {
    return {
        ...convertor(customer),
        orders: manyOrders.bind(this, customer._doc.orders),
    };
};
