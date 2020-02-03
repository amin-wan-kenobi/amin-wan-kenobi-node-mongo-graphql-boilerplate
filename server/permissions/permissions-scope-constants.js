const SCOPES = {
    CUSTOMER: {
        NAME: 'CUSTOMER',
        ALL_CUSTOMER_SCOPE: 1,
        customers: 2,
        saveCustomer: 3,
        getCustomerById: 4,
        updateCustomer: 5,
        deleteCustomer: 6,
    },
    ORDER: {
        NAME: 'ORDER',
        ALL_ORDER_SCOPE: 11,
        orders: 12,
        saveOrder: 13,
        getOrderById: 14,
        updateOrder: 15,
        deleteOrder: 16,
    },
};

export default SCOPES;