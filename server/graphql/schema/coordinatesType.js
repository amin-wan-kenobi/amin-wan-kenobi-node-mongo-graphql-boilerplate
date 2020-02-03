const coordinatesSchemaString = `
        type Coordinates {
            longitude: String!
            latitude: String!
        }
        input CoordinatesInput {
            longitude: String!
            latitude: String!
        }
        `;

export default coordinatesSchemaString;