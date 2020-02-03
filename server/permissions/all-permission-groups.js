import { ObjectID, } from 'mongodb';
import permissions from './all-permissions';

const prepareAllPermissions = permissions => permissions.map(permission => permission);

const adminGroup = {
    _id: new ObjectID(),
    name: 'Admin Group',
    permissions: prepareAllPermissions(permissions),
    description: 'This group is for Admins only',
};

const customerServiceGroup = {
    _id: new ObjectID(),
    name: 'Customer Servive Group',
    permissions: [
        permissions[0],
        permissions[3],
    ],
    description: 'This group is for Customer Service only',
};

export default { adminGroup, customerServiceGroup, };