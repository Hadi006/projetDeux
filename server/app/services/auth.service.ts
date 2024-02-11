import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class AuthService {
    constructor(private database: DatabaseService) {}

    async validatePassword(password: unknown): Promise<boolean> {
        const RESULT = (await this.database.get<object>('password'))[0];

        return Boolean(RESULT && 'password' in RESULT && RESULT.password === password);
    }

    async validateToken(token: unknown): Promise<boolean> {
        if (!this.isObjectToken(token)) {
            return false;
        }

        await this.database.delete('tokens', { expirationDate: { $lt: Date.now() } });
        const RESULT = await this.database.get('tokens', { id: token.id });

        return RESULT && RESULT.length > 0;
    }
}
