import { AccessToken } from '@common/access-token';
import { TOKEN_EXPIRATION } from '@common/constant';
import { randomUUID } from 'crypto';
import { Service } from 'typedi';
import { DatabaseService } from '../database/database.service';

@Service()
export class AuthService {
    constructor(private database: DatabaseService) {}

    async validatePassword(password: unknown): Promise<boolean> {
        const result = (await this.database.get<object>('password'))[0];

        return Boolean(result && 'password' in result && result.password === password);
    }

    async validateToken(token: unknown): Promise<boolean> {
        if (!this.isObjectToken(token)) {
            return false;
        }

        await this.database.delete('tokens', { expirationDate: { $lt: Date.now() } });

        return (await this.database.get('tokens', { id: token.id })).length > 0;
    }

    async generateAccessToken(): Promise<AccessToken> {
        const token = { id: randomUUID(), expirationDate: Date.now() + TOKEN_EXPIRATION };
        this.database.add('tokens', token);

        return token;
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
