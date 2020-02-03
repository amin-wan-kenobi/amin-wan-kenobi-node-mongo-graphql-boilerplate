import expect from 'expect';
import { GraphQLNonNull, GraphQLList, GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, } from 'graphql';

import allSchemas from '../../graphql/schema';

describe('---------------------- Queries and Mutations ----------------------', () => {
    const allQueries = allSchemas.getType('Query').getFields();
    const allMutations = allSchemas.getType('Mutation').getFields();
    const customerInput = allSchemas.getType('CustomerInput').toConfig();
    const orderInput = allSchemas.getType('OrderInput').toConfig();

    describe('-- QUERIES --', () => {
        it('should check number of all the queries', () => {
            expect(allQueries).toBeTruthy();
            expect(Object.keys(allQueries).length).toBe(5);
        });
        ///////////////////////////////////////////////////////////////////////
        it('should pass customers query for CUSTOMER', () => {
            expect(allQueries.customers.type.toString()).toBe(GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'Customer', })))).toString());
        });

        it('should pass getCustomerById query for CUSTOMER', () => {
            expect(allQueries.getCustomerById.type.toString()).toBe(new GraphQLObjectType({ name: 'Customer', }).toString());
            expect(allQueries.getCustomerById.args[0].type.toString()).toBe(GraphQLNonNull(GraphQLID).toString());
        });
        ///////////////////////////////////////////////////////////////////////
        it('should pass all the queries for ORDER', () => {
            expect(allQueries.orders.type.toString()).toBe(GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'Order', })))).toString());
        });

        it('should pass getOrderById query for ORDER', () => {
            expect(allQueries.getOrderById.type.toString()).toBe(new GraphQLObjectType({ name: 'Order', }).toString());
            expect(allQueries.getOrderById.args[0].type.toString()).toBe(GraphQLNonNull(GraphQLID).toString());
        });
        ///////////////////////////////////////////////////////////////////////
        it('should pass all the queries for login - This is a temp case and should be removed later', () => {
            expect(allQueries.login.type).toBe(GraphQLString);
        });
    });

    describe('-- MUTATIONS --', () => {
        it('should check number of all the mutations', () => {
            expect(allMutations).toBeTruthy();
            expect(Object.keys(allMutations).length).toBe(6);
        });
        ///////////////////////////////////////////////////////////////////////
        it('should pass saveCustomer mutation for CUSTOMER', () => {
            expect(allMutations.saveCustomer.type.toString()).toBe(new GraphQLObjectType({ name: 'Customer', }).toString());
            expect(allMutations.saveCustomer.args[0].type.toString()).toBe(new GraphQLObjectType({ name: customerInput.name, }).toString());
        });

        it('should pass updateCustomer mutation for CUSTOMER', () => {
            expect(allMutations.updateCustomer.type.toString()).toBe(new GraphQLObjectType({ name: 'Customer', }).toString());
            expect(allMutations.updateCustomer.args[0].type.toString()).toBe(GraphQLNonNull(GraphQLID).toString());
            expect(allMutations.updateCustomer.args[1].type.toString()).toBe(GraphQLString.toString());
            expect(allMutations.updateCustomer.args[2].type.toString()).toBe(GraphQLString.toString());
            expect(allMutations.updateCustomer.args[3].type.toString()).toBe(GraphQLString.toString());
            expect(allMutations.updateCustomer.args[4].type.toString()).toBe(new GraphQLObjectType({ name: 'CoordinatesInput', }).toString());
            expect(allMutations.updateCustomer.args[5].type.toString()).toBe(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'MetadataInput', }))).toString());
            expect(allMutations.updateCustomer.args[6].type.toString()).toBe(GraphQLList(GraphQLNonNull(GraphQLID)).toString());
        });

        it('should pass deleteCustomer mutation for CUSTOMER', () => {
            expect(allMutations.deleteCustomer.type.toString()).toBe(new GraphQLObjectType({ name: 'Customer', }).toString());
            expect(allMutations.deleteCustomer.args[0].type.toString()).toBe(GraphQLNonNull(GraphQLID).toString());
        });
        ///////////////////////////////////////////////////////////////////////
        it('should pass all the mutations for ORDER', () => {
            expect(allMutations.saveOrder.type.toString()).toBe(new GraphQLObjectType({ name: 'Order', }).toString());
            expect(allMutations.saveOrder.args[0].type.toString()).toBe(new GraphQLObjectType({ name: 'OrderInput', }).toString());
        });

        it('should pass updateOrder mutation for ORDER', () => {
            expect(allMutations.updateOrder.type.toString()).toBe(new GraphQLObjectType({ name: 'Order', }).toString());
            expect(allMutations.updateOrder.args[0].type.toString()).toBe(GraphQLNonNull(GraphQLID).toString());
            expect(allMutations.updateOrder.args[1].type.toString()).toBe(GraphQLString.toString());
            expect(allMutations.updateOrder.args[2].type.toString()).toBe(GraphQLList(GraphQLNonNull(new GraphQLObjectType({ name: 'MetadataInput', }))).toString());
        });

        it('should pass deleteOrder mutation for ORDER', () => {
            expect(allMutations.deleteOrder.type.toString()).toBe(new GraphQLObjectType({ name: 'Order', }).toString());
            expect(allMutations.deleteOrder.args[0].type.toString()).toBe(GraphQLNonNull(GraphQLID).toString());
        });
    });
});