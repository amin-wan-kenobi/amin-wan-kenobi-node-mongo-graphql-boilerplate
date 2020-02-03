import IDs from './ids-seed';

const metadataCustomer = [{
    key: 'Key1',
    value: 'Some Information about Key1',
}, {
    key: 'Key2',
    value: 'Some Information about Key2',
},];

export const seedCustomer = [{
    _id: IDs.customerIDs[0],
    name: 'John Smith',
    coordinates: {
        longitude: '-73.6154157',
        latitude: '45.5267912',
    },
    orders: [IDs.orderIDs[0],],
    createdBy: IDs.userIDs[0],
    metadata: metadataCustomer,
}, {
    _id: IDs.customerIDs[1],
    name: 'John Doe',
    coordinates: {
        longitude: '139.880402',
        latitude: '35.632896',
    },
    orders: [],
    createdBy: IDs.userIDs[0],
    metadata: metadataCustomer,
},];
