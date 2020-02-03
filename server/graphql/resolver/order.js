import Order from '../../models/order';
import Customer from '../../models/customer';
import { ObjectID, } from 'mongodb';
import { orderTransform, } from '../mergers/order.merger';
import { mongoose, } from '../../db/mongoose';
import genericMiddlewear from '../../middlewares/generic.middlewear';
import SCOPES from '../../permissions/permissions-scope-constants';
import MessageUtil from '../../helpers/message-util';
import orderStatus from '../../constants/orderStatus';
import { updateModel, } from '../../helpers/update-model';

const orderQueriesMutations = {
    orders: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.orders, req);
            const orders = await Order.find();
            return orders.map(order => orderTransform(order));
        } catch (e) {
            throw new Error(e);
        }
    },
    saveOrder: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.saveOrder, req);
            const inputOrder = args.order;

            if (req && req.userId) {
                inputOrder.createdBy = new ObjectID(req.userId);
            }
            return await saveOrderUpdateCustomer(inputOrder);
        } catch (e) {
            throw new Error(e);
        }
    },
    getOrderById: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.getOrderById, req);
            const orderId = args.id;
            const order = await Order.findById(orderId);
            return orderTransform(order);
        } catch (e) {
            throw new Error(e);
        }
    },
    updateOrder: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.updateOrder, req);
            const allArgumentsObj = args;
            if (req && req.userId) {
                allArgumentsObj.updatedBy = new ObjectID(req.userId);
            }
            return updateModel(Order, allArgumentsObj._id, allArgumentsObj, orderTransform, MessageUtil.MODEL_NOT_FOUND);
        }
        catch (e) {
            throw new Error(e);
        }
    },
    deleteOrder: async (args, req) => {
        try {
            genericMiddlewear(SCOPES.ORDER.ALL_ORDER_SCOPE, SCOPES.ORDER.deleteOrder, req);
            if (args && args._id) {
                let fieldsToBeUpdated = { orderStatus: orderStatus.Cancelled, };
                if (req && req.userId) {
                    fieldsToBeUpdated.updatedBy = new ObjectID(req.userId);
                }
                return updateModel(Order, args._id, fieldsToBeUpdated, orderTransform, MessageUtil.MODEL_NOT_FOUND);
            }
        } catch (e) {
            throw new Error(e);
        }
    },
};

const saveOrderUpdateCustomer = async (inputOrder) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, };
        const order = new Order(inputOrder);
        let savedOrder = await order.save(opts);
        //update Customer Orders here with order.id
        let customer = await Customer.findById(savedOrder.customer);
        if (!customer) {
            throw new Error(`No Customer was found for ${savedOrder.number} Order`);
        }
        customer.orders.push(savedOrder);
        await customer.save(opts);
        savedOrder = orderTransform(savedOrder);
        await session.commitTransaction();
        session.endSession();
        return savedOrder;
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
    }
};

export default orderQueriesMutations;