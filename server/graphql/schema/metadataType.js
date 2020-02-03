const metadataSchemaString = `
    type Metadata {
        key: String!
        value: String!
    }

    input MetadataInput {
        key: String!
        value: String!
    }`;

export default metadataSchemaString;