import { ObjectID, } from 'mongodb';
import orderResolver from '../../graphql/resolver/order';

export const createOrder = (_id, customerId, name) => {
    const order = {
        _id,
        name,
        customer: customerId,
        createdBy: new ObjectID(),
    };
    return orderResolver.saveOrder({ order, });
};
