const customerSchemaString = `
    type Customer {
        _id: ID!
        name: String!
        coordinates: Coordinates
        orders: [Order!]!
        status: ModelStatus!
        metadata: [Metadata!]!
        createdBy: String!
        updatedBy: String
    }

    input CustomerInput {
        name: String!
        coordinates: CoordinatesInput
        metadata: [MetadataInput!]
        orders: [ID!]
    }
    extend type Query {
        customers: [Customer!]!
        getCustomerById(id: ID!): Customer
    }
    extend type Mutation {
        saveCustomer(customer: CustomerInput): Customer
        updateCustomer(_id: ID!,
            name: String,
            startDate: String,
            endDate: String,
            coordinates:CoordinatesInput,
            metadata: [MetadataInput!],
            orders: [ID!]): Customer
        deleteCustomer(_id: ID!): Customer
    }`;

export default customerSchemaString;