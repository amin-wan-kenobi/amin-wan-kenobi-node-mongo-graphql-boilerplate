import expect from 'expect';
import { ObjectID, } from 'mongodb';
import IdUtil from '../../helpers/id-util';

describe('---------------------- ID UTIL TEST ----------------------', () => {
    
    it('should successfully returns a correct object id', () => {
        let objectId = new ObjectID();
        const safeObjectId = IdUtil(objectId);
        expect(safeObjectId).toBeTruthy();
        expect(typeof safeObjectId).toBe('object');
        expect(ObjectID.isValid(safeObjectId)).toBe(true);
    });

    it('should successfully returns a correct object id from a string', () => {
        let objectId = new ObjectID().toHexString();
        const safeObjectId = IdUtil(objectId);
        expect(safeObjectId).toBeTruthy();
        expect(typeof safeObjectId).toBe('object');
        expect(ObjectID.isValid(safeObjectId)).toBe(true);
    });

    it('should returns null if object id is not valid', () => {
        let objectId = '1234567890';
        const safeObjectId = IdUtil(objectId);
        expect(safeObjectId).toBeNull();
    });
});