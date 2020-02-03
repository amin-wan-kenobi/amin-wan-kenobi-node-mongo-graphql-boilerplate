const adminUserSchemaString = `
    type AdminUser {
        _id: ID!
        name: String!
        email: String!
        username: String!
        password: String!
        company: String!
        permissions: [Int!]!
        permissionGroups: [ID!]!
        metadata: [Metadata!]!
        createdBy: String!
        updatedBy: String
    }

    extend type Query {
        login(username: String!, password: String!): String
    }
    `;

export default adminUserSchemaString;