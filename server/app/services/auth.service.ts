import { AccessToken } from '@common/access-token';
import { randomUUID } from 'crypto';
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

    async generateAccessToken(): Promise<AccessToken> {
        const ONE_HOUR_MS = 3_600_000;
        const TOKEN = { id: randomUUID(), expirationDate: Date.now() + ONE_HOUR_MS };
        this.database.add('tokens', TOKEN);

        return TOKEN;
    }

    private isObjectToken(obj: unknown): obj is AccessToken {
        return (
            obj &&
            typeof obj === 'object' &&
            'id' in obj &&
            'expirationDate' in obj &&
            typeof obj.id === 'string' &&
            typeof obj.expirationDate === 'number'
        );
    }
}
