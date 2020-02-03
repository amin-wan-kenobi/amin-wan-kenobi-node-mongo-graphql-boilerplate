import customerResolver from './customer';
import orderResolver from './order';

import adminUser from './adminUser';

const rootResolver = {
    ...customerResolver,
    ...orderResolver,
    ...adminUser,
};

export default rootResolver;
