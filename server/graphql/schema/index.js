import { makeExecutableSchema, } from 'graphql-tools';
import rootType from './rootType';
import enums from './enums';
import coordinatesType from './coordinatesType';
import customerType from './customerType';
import orderType from './orderType';
import metadataType from './metadataType';

import adminUserType from './adminUserType';

export default makeExecutableSchema({
    typeDefs: [
        rootType,
        enums,
        coordinatesType,
        metadataType,
        customerType,
        orderType,
        adminUserType,
    ],
});