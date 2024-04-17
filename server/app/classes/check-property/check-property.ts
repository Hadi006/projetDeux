export class CheckProperty {
    static checkIfEmptyString(obj: object, property: string, compilationError: string): string {
        // if (!(property in obj) || typeof obj[property] !== 'string' || obj[property] === '') {
        //     compilationError += `${property} : doit être une chaine de caractères non vide !\n`;
        // }
        if (!(property in obj) || typeof Reflect.get(obj, property) !== 'string' || Reflect.get(obj, property) === '') {
            return compilationError;
        }

        return '';
    }
}