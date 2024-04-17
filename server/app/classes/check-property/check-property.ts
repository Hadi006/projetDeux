export class CheckProperty {
    static checkIfEmptyString(obj: object, property: string, compilationError: string): string {
        if (!(property in obj) || typeof Reflect.get(obj, property) !== 'string' || Reflect.get(obj, property) === '') {
            return compilationError;
        }

        return '';
    }
}
