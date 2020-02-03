import expect from 'expect';
import { ObjectID, } from 'mongodb';
import Customer from '../../models/customer';
import Order from '../../models/order';
import Permission from '../../models/permission';
import PermissionGroup from '../../models/permissionGroup';
import AdminUser from '../../models/adminUser';

import allSchemas from '../../graphql/schema';

describe('---------------------- MONGOOSE MODELS ----------------------', () => {
    describe('-- Customer Model --', () => {
        it('should check the number of fields in the CUSTOMER', () => {
            const customerSchmeaObj = Customer.prototype.schema.obj;
            expect(Object.keys(customerSchmeaObj).length).toBe(7);
        });

        it('should test all the required values for CUSTOMER are set', () => {
            const customer = new Customer({});
            const { errors, } = customer.validateSync();

            expect(Object.keys(errors).length).toBe(2);

            const { createdBy, name, } = errors;
            expect(createdBy).toBeTruthy();
            expect(createdBy.message).toBe('Path `createdBy` is required.');

            expect(name).toBeTruthy();
            expect(name.message).toBe('Path `name` is required.');
        });

        it('should ensure that status is one of the following ===> [Active, Inactive]', () => {
            const customer = new Customer({
                name: 'Name of the Customer',
                status: 'ANYTHING',
                createdBy: new ObjectID(),
            });
            const { errors, } = customer.validateSync();
            const { status, } = errors;
            expect(status.message).toContain('is not a valid enum value for path `status`');
        });

        it('should pass when status value are acceptable by mongoose model', () => {
            const statusEnum = allSchemas.getType('ModelStatus').toConfig().values;
            const { Active, Inactive, } = statusEnum;
            let customer = null;
            let errors = [];

            customer = new Customer({
                name: 'Name of the Customer',
                status: Active.value,
                createdBy: new ObjectID(),
            });
            errors = customer.validateSync();
            expect(errors).toBeFalsy();

            customer = new Customer({
                name: 'Name of the Customer',
                status: Inactive.value,
                createdBy: new ObjectID(),
            });
            errors = customer.validateSync();
            expect(errors).toBeFalsy();
        });
    });

    describe('-- Order Model --', () => {
        it('should check the number of fields in the ORDER', () => {
            const orderSchmeaObj = Order.prototype.schema.obj;
            expect(Object.keys(orderSchmeaObj).length).toBe(6);
        });

        it('should test all the required values for ORDER are set', () => {
            const order = new Order({});
            const { errors, } = order.validateSync();

            expect(Object.keys(errors).length).toBe(1);

            const { number, } = errors;
            expect(number).toBeTruthy();
            expect(number.message).toBe('Path `number` is required.');
        });

        it('should ensure that orderStatus is one of the following ===> [Pending, Completed, Cancelled]', () => {
            const order = new Order({
                number: 'Order Name',
                createdBy: new ObjectID(),
                orderStatus: 'ANYTHING',
            });
            const { errors, } = order.validateSync();
            const { orderStatus, } = errors;
            expect(orderStatus.message).toContain('is not a valid enum value for path `orderStatus`');
        });

        it('should pass when orderStatus value are acceptable by mongoose model', () => {
            const orderStatusEnum = allSchemas.getType('OrderStatus').toConfig().values;
            const { Pending, Completed, Cancelled,} = orderStatusEnum;
            let order = null;
            let errors = [];

            order = new Order({
                number: 'Order Number',
                orderStatus: Pending.value,
                createdBy: new ObjectID(),
            });
            errors = order.validateSync();
            expect(errors).toBeFalsy();

            order = new Order({
                number: 'Order Number',
                orderStatus: Completed.value,
                createdBy: new ObjectID(),
            });
            errors = order.validateSync();
            expect(errors).toBeFalsy();

            order = new Order({
                number: 'Order Number',
                orderStatus: Cancelled.value,
                createdBy: new ObjectID(),
            });
            errors = order.validateSync();
            expect(errors).toBeFalsy();
        });
    });

    describe('-- Permission Model --', () => {
        it('should check the number of fields in the Permission', () => {
            const permissionSchmeaObj = Permission.prototype.schema.obj;
            expect(Object.keys(permissionSchmeaObj).length).toBe(7);
        });

        it('should test all the required values for PERMISSION are set', () => {
            const permission = new Permission({});
            const { errors, } = permission.validateSync();

            expect(Object.keys(errors).length).toBe(4);
            
            const { permissionName, permissionScope, scopeId, description, } = errors;
            expect(permissionName).toBeTruthy();
            expect(permissionName.message).toBe('Path `permissionName` is required.');

            expect(permissionScope).toBeTruthy();
            expect(permissionScope.message).toBe('Path `permissionScope` is required.');

            expect(scopeId).toBeTruthy();
            expect(scopeId.message).toBe('Path `scopeId` is required.');

            expect(description).toBeTruthy();
            expect(description.message).toBe('Path `description` is required.');
        });
    });

    describe('-- Permission Group Model --', () => {
        it('should check the number of fields in the Permission Group', () => {
            const permissionGroupSchmeaObj = PermissionGroup.prototype.schema.obj;
            expect(Object.keys(permissionGroupSchmeaObj).length).toBe(6);
        });

        it('should test all the required values for PERMISSION GROUP are set', () => {
            const permissionGroup = new PermissionGroup({});
            const { errors, } = permissionGroup.validateSync();

            expect(Object.keys(errors).length).toBe(2);
            
            const { name, description, } = errors;
            expect(name).toBeTruthy();
            expect(name.message).toBe('Path `name` is required.');

            expect(description).toBeTruthy();
            expect(description.message).toBe('Path `description` is required.');
        });
    });

    describe('-- AdminUser Model --', () => {
        it('should check the number of fields in the AdminUser', () => {
            const adminUserSchmeaObj = AdminUser.prototype.schema.obj;
            expect(Object.keys(adminUserSchmeaObj).length).toBe(10);
        });

        it('should test all the required values for ADMIN USER are set', () => {
            const adminUser = new AdminUser({});
            const { errors, } = adminUser.validateSync();

            expect(Object.keys(errors).length).toBe(5);
            
            const { name, email, username, password, company, } = errors;
            expect(name).toBeTruthy();
            expect(name.message).toBe('Path `name` is required.');

            expect(email).toBeTruthy();
            expect(email.message).toBe('Path `email` is required.');

            expect(username).toBeTruthy();
            expect(username.message).toBe('Path `username` is required.');

            expect(password).toBeTruthy();
            expect(password.message).toBe('Path `password` is required.');

            expect(company).toBeTruthy();
            expect(company.message).toBe('Path `company` is required.');
        });

        it('should ensure that email is email', () => {
            const adminUserToBeCreated = {
                name: 'John',
                email: 'email',
                username: 'johnsmith',
                password: '123456',
                company: 'Company A',
            };
            const adminUser = new AdminUser(adminUserToBeCreated);
            const { errors, } = adminUser.validateSync();
            
            const { email, } = errors;

            expect(email).toBeTruthy();
            expect(email.message).toBe('email is not a valid email');
        });
    });
});