const orderSchemaString = `
        type Order {
            _id: ID!
            number: String!
            customer: Customer!
            orderStatus: OrderStatus!
            metadata: [Metadata!]!
            createdBy: String!
            updatedBy: String
        }

        input OrderInput {
            number: String!
            customer: ID!
            metadata: [MetadataInput!]
        }
        extend type Query {
            orders: [Order!]!
            getOrderById(id: ID!): Order
        }
        extend type Mutation {
            saveOrder(order: OrderInput): Order
            updateOrder(_id: ID!,
                number: String,
                metadata: [MetadataInput!]): Order
            deleteOrder(_id: ID!): Order
        }
    `;

export default orderSchemaString;