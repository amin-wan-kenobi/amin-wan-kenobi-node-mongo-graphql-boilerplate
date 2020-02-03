import Customer from '../../models/customer';
import { ObjectID, } from 'mongodb';
import { customerTransform, } from '../mergers/customer.merger';
import genericMiddlewear from '../../middlewares/generic.middlewear';
import SCOPES from '../../permissions/permissions-scope-constants';
import MessageUtil from '../../helpers/message-util';
import status from '../../constants/status';
import { updateModel, } from '../../helpers/update-model';

const customerQueriesMutations = {
    customers: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.customers, req);
            const customers = await Customer.find();
            return customers.map(customer => customerTransform(customer));
        } catch (e) {
            throw new Error(e);
        }
    },
    saveCustomer: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.saveCustomer, req);
            const inputCustomer = args.customer;

            if (req && req.userId) {
                inputCustomer.createdBy = new ObjectID(req.userId);
            }

            const customer = new Customer(inputCustomer);
            let savedCustomer = await customer.save();
            return customerTransform(savedCustomer);
        } catch (e) {
            throw new Error(e);
        }
    },
    getCustomerById: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.getCustomerById, req);
            const customerId = args.id;
            const customer = await Customer.findById(customerId);
            return customerTransform(customer);
        } catch (e) {
            throw new Error(e);
        }
    },
    updateCustomer: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.updateCustomer, req);
            const allArgumentsObj = args;
            if (req && req.userId) {
                allArgumentsObj.updatedBy = new ObjectID(req.userId);
            }
            return updateModel(Customer, allArgumentsObj._id, allArgumentsObj, customerTransform, MessageUtil.MODEL_NOT_FOUND);
        }
        catch (e) {
            throw new Error(e);
        }
    },
    deleteCustomer: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.CUSTOMER.ALL_CUSTOMER_SCOPE, SCOPES.CUSTOMER.deleteCustomer, req);
            if (args && args._id) {
                let fieldsToBeUpdated = { status: status.Inactive, };
                if (req && req.userId) {
                    fieldsToBeUpdated.updatedBy = new ObjectID(req.userId);
                }
                return updateModel(Customer, args._id, fieldsToBeUpdated, customerTransform, MessageUtil.MODEL_NOT_FOUND);
            }
        } catch (e) {
            throw new Error(e);
        }
    },
};

export default customerQueriesMutations;