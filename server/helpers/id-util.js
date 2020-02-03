import { ObjectID, } from 'mongodb';

export default (mongoID) => {
    return ObjectID.isValid(mongoID) ? new ObjectID(mongoID) : null;
};