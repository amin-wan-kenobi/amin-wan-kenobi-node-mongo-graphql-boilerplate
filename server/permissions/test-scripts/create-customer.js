import { ObjectID, } from 'mongodb';
import customerResolver from '../../graphql/resolver/customer';

const customer = {
    name: 'John Smith',
};

export const createCustomer = (customerId) => {
    customer.createdBy = new ObjectID();
    customer._id = customerId;
    return customerResolver.saveCustomer({ customer, });
};

