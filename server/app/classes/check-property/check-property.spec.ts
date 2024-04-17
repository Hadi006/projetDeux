import { CheckProperty } from '@app/classes/check-property/check-property';
import { expect } from 'chai';
describe('CheckProperty', () => {
    describe('checkIfEmptyString', () => {
        it('should return compilationError if property is not present in obj', () => {
            const obj = {};
            const property = 'name';
            const compilationError = 'Property is empty or not a string';
            const result = CheckProperty.checkIfEmptyString(obj, property, compilationError);
            expect(result).to.equal(compilationError);
        });

        it('should return compilationError if property is not a string', () => {
            const obj = { name: 123 };
            const property = 'name';
            const compilationError = 'Property is empty or not a string';
            const result = CheckProperty.checkIfEmptyString(obj, property, compilationError);
            expect(result).to.equal(compilationError);
        });

        it('should return compilationError if property is an empty string', () => {
            const obj = { name: '' };
            const property = 'name';
            const compilationError = 'Property is empty or not a string';
            const result = CheckProperty.checkIfEmptyString(obj, property, compilationError);
            expect(result).to.equal(compilationError);
        });

        it('should return an empty string if property is a non-empty string', () => {
            const obj = { name: 'John' };
            const property = 'name';
            const compilationError = 'Property is empty or not a string';
            const result = CheckProperty.checkIfEmptyString(obj, property, compilationError);
            expect(result).to.equal('');
        });

        it('should return an empty string if property is a non-empty string with whitespace', () => {
            const obj = { name: '   John   ' };
            const property = 'name';
            const compilationError = 'Property is empty or not a string';
            const result = CheckProperty.checkIfEmptyString(obj, property, compilationError);
            expect(result).to.equal('');
        });
    });
});
