import Dataloader from 'dataloader';
import Order from '../../models/order';

import convertor from '../../helpers/doc-model-convertor';
import { singleCustomer, } from './customer.merger';

const orderLoader = new Dataloader(orderIds => findOrders(orderIds), { batch: false, });

const findOrders = async orderIds => {
    try {
        const orders = await Order.find({ _id: { $in: orderIds, }, });

        return orders.map(order => orderTransform(order));
    } catch (e) {
        throw e;
    }
};

export const singleOrder = async orderId => {
    try {
        const order = await orderLoader.load(orderId);
        return order;
    } catch (e) {
        throw e;
    }
};

export const manyOrders = async orderIds => {
    try {
        const orders = await orderLoader.loadMany(orderIds);
        return orders;
    } catch (e) {
        throw e;
    }
};

export const orderTransform = order => {
    return {
        ...convertor(order),
        customer: singleCustomer.bind(this, order._doc.customer),
    };
};

