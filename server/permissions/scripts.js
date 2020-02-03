import Permission from '../models/permission';
import PermissionGroup from '../models/permissionGroup';
import AdminUser from '../models/adminUser';
import Customer from '../models/customer';
import Order from '../models/order';

import permissions from './all-permissions';
import allPermissionGroups from './all-permission-groups';
import allUsers from './all-users';

export const pushRequiredDataIntoDB = async () => {
    try {
//////////////////////////////////////////////// Push all permissions into DB
        await Permission.deleteMany({});
        await Promise.all(permissions.map(permission => new Permission(permission).save()));
        console.log('Permissions are Saved');
//////////////////////////////////////////////// Push all permission groups into DB
        await PermissionGroup.deleteMany({});
        await Promise.all([
            new PermissionGroup(allPermissionGroups.adminGroup).save(),
            new PermissionGroup(allPermissionGroups.customerServiceGroup).save(),
        ]);
        console.log('Permission Groups were saved');
//////////////////////////////////////////////// Push all users into DB
        await AdminUser.deleteMany({});
        await Promise.all(allUsers.map(user => new AdminUser(user).save()));
        console.log('AdminUsers & Customer Service Users are Saved');
//////////////////////////////////////////////// Delete Collections
        await Customer.deleteMany({});
        await Order.deleteMany({});
        console.log('Collections are deleted');
//////////////////////////////////////////////// Create Collections
        await Customer.createCollection();
        await Order.createCollection();

        console.log('Collections are created and ready');
    }
    catch (e) {
        console.log('Error happened during saving permissions, permission groups or admin users ->', e.message);
    }
};
