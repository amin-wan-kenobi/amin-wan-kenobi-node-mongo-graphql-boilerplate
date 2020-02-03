import allPermissionGroups from './all-permission-groups';
//The issue with this approach is, if we change permissions for a group then we have to look for all the 
//users which have the same permission group and update the list of their permissions
//It can however be solved at the login time. When user logs in, we check user permission group 
//and then we get the list of all permissions in that group and compare it with user's list.
const allUsers = [
    {
        name: 'John',
        email: 'john@example.com',
        username: 'john',
        password: '12345678',
        company: 'Company A',
        permissionGroups: allPermissionGroups.adminGroup._id,
        permissions: getScopeIds(allPermissionGroups.adminGroup.permissions),
    },
    {
        name: 'Peter',
        email: 'peter@example.com',
        username: 'peter',
        password: '12345678',
        company: 'Company B',
        permissionGroups: allPermissionGroups.adminGroup._id,
        permissions: getScopeIds(allPermissionGroups.adminGroup.permissions),
    },
];

function getScopeIds(permissions) {
    return permissions.map(permission => permission.scopeId);
}

export default allUsers;