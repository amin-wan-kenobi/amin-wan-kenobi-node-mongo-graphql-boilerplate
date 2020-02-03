import IDs from './ids-seed';

const metadata = [{
    key: 'Key1',
    value: 'Some Information about Order and Key1',
}, {
    key: 'Key2',
    value: 'Some Information about Order and Key2',
},];

export const seedOrder = [{
    _id: IDs.orderIDs[0],
    number: '123STR',
    customer: IDs.customerIDs[0]._id,
    createdBy: IDs.userIDs[0],
    metadata,
}, {
    _id: IDs.orderIDs[1],
    number: '987WER',
    customer: IDs.customerIDs[0]._id,
    createdBy: IDs.userIDs[0],
    metadata,
},];
