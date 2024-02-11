import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class AuthService {
    constructor(private database: DatabaseService) {}

    async validatePassword(password: unknown): Promise<boolean> {
        const RESULT = (await this.database.get<object>('password'))[0];

        return Boolean(RESULT && 'password' in RESULT && RESULT.password === password);
    }
}
