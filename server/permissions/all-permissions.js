import { ObjectID, } from 'mongodb';
import SCOPES from './permissions-scope-constants';

//Below is the one we push into the database
const customerPermissions = [
    {
        _id: new ObjectID(),
        permissionName: 'customers',
        permissionScope: SCOPES.CUSTOMER.NAME,
        scopeId: SCOPES.CUSTOMER.customers,
        description: 'This permission is to get the list of all customers',
    }, {
        _id: new ObjectID(),
        permissionName: 'saveCustomer',
        permissionScope: SCOPES.CUSTOMER.NAME,
        scopeId: SCOPES.CUSTOMER.saveCustomer,
        description: 'This permission is to save an customer',
    }, {
        _id: new ObjectID(),
        permissionName: 'getCustomerById',
        permissionScope: SCOPES.CUSTOMER.NAME,
        scopeId: SCOPES.CUSTOMER.getCustomerById,
        description: 'This permission is to get an Customer by Id',
    },
    {
        _id: new ObjectID(),
        permissionName: 'updateCustomer',
        permissionScope: SCOPES.CUSTOMER.NAME,
        scopeId: SCOPES.CUSTOMER.updateCustomer,
        description: 'This permission is to update an Customer by Id',
    },
    {
        _id: new ObjectID(),
        permissionName: 'deleteCustomer',
        permissionScope: SCOPES.CUSTOMER.NAME,
        scopeId: SCOPES.CUSTOMER.deleteCustomer,
        description: 'This permission is to delete an Customer by Id',
    },
];

const orderPermissions = [
    {
        _id: new ObjectID(),
        permissionName: 'orders',
        permissionScope: SCOPES.ORDER.NAME,
        scopeId: SCOPES.ORDER.orders,
        description: 'This permission is to get the list of all orders',
    }, {
        _id: new ObjectID(),
        permissionName: 'saveOrder',
        permissionScope: SCOPES.ORDER.NAME,
        scopeId: SCOPES.ORDER.saveOrder,
        description: 'This permission is to save a order',
    }, {
        _id: new ObjectID(),
        permissionName: 'getOrderById',
        permissionScope: SCOPES.ORDER.NAME,
        scopeId: SCOPES.ORDER.getOrderById,
        description: 'This permission is to get a Order by Id',
    },
    {
        _id: new ObjectID(),
        permissionName: 'updateOrder',
        permissionScope: SCOPES.ORDER.NAME,
        scopeId: SCOPES.ORDER.updateOrder,
        description: 'This permission is to update a Order by Id',
    },
];

export default [
    ...customerPermissions,
    ...orderPermissions,
];