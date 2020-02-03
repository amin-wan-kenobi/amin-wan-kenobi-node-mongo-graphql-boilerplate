//This will be used to create Seeds for anything we need.
import Customer from '../../models/customer';
import Order from '../../models/order';

import { seedCustomer, } from './customer-seed';
import { seedOrder, } from './order-seed';

const feedCollection = async (collection, numberOfDocuments = 1, seeds, deleteDB = true) => {
    deleteDB ? await collection.deleteMany({}) : null;
    if (numberOfDocuments > seeds.length) {
        numberOfDocuments = seeds.length;
    }
    const documentPromises = [];
    for (let i = 0; i < numberOfDocuments; i++) {
        documentPromises.push(new collection(seeds[i]).save());
    }
    return Promise.all(documentPromises);
};

const feedCustomers = (numberOfDocuments = 2, deleteDB = true) => {
    return feedCollection(Customer, 1, seedCustomer, deleteDB);
};

const feedOrders = (numberOfDocuments = 2, deleteDB = true) => {
    return feedCollection(Order, numberOfDocuments, seedOrder, deleteDB);
};


export const populateCustomer = done => {
    feedCustomers().then(() => done());
};

export const populateOrder = done => {
    feedOrders().then(() => done());
};

export const populateOrderCustomer = done => {
    feedCustomers()
        .then(() => feedOrders())
        .then(() => done());
};
