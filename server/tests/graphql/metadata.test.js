import expect from 'expect';
import { GraphQLNonNull, GraphQLString, } from 'graphql';

import allSchemas from '../../graphql/schema';

describe('---------------------- Metadata ----------------------', () => {
    const metadata = allSchemas.getType('Metadata').toConfig();
    const metadataInput = allSchemas.getType('MetadataInput').toConfig();
    
    describe('-- MetadataType Schema --', () => {
        it('should pass when all the existing types are in the Metadata Schema', () => {
            expect(metadata).toBeTruthy();

            expect(Object.keys(metadata.fields).length).toBe(2);

            expect(metadata.fields).toHaveProperty('key');
            expect(metadata.fields.key.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(metadata.fields).toHaveProperty('value');
            expect(metadata.fields.value.type).toEqual(GraphQLNonNull(GraphQLString));
        });

        it('should pass when MetadataInput is present', () => {
            expect(metadataInput).toBeTruthy();

            expect(Object.keys(metadataInput.fields).length).toBe(2);

            expect(metadataInput.fields).toHaveProperty('key');
            expect(metadataInput.fields.key.type).toEqual(GraphQLNonNull(GraphQLString));

            expect(metadataInput.fields).toHaveProperty('value');
            expect(metadataInput.fields.value.type).toEqual(GraphQLNonNull(GraphQLString));
        });
    });
});