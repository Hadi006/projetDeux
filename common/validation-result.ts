interface ValidationResult<T> {
    data?: T;
    error: string;
}

class ValidationResult<T> implements ValidationResult<T> {
    constructor(error: string = '', data?: T) {
        this.error = error;
        this.data = data;
    }
}

export { ValidationResult };

