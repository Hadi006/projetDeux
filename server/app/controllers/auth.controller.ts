import { AuthService } from '@app/services/auth.service';
import { Request, Response, Router } from 'express';
import httpStatus from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AuthController {
    router: Router;

    constructor(private readonly authService: AuthService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        this.router.post('/password', async (req: Request, res: Response) => {
            const ADMIN_PASSWORD: unknown = req.body.password;
            let accessToken: unknown = req.body.token;

            const AUTHENTIFICATED = await this.authService.validatePassword(ADMIN_PASSWORD);
            const AUTHORIZED = await this.authService.validateToken(accessToken);

            if (AUTHENTIFICATED && !AUTHORIZED) {
                accessToken = await this.authService.generateAccessToken();
            }

            res.status(AUTHENTIFICATED ? httpStatus.OK : httpStatus.FORBIDDEN).json({ token: accessToken });
        });
    }
}
