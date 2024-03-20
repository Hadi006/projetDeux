import { AuthService } from '@app/services/auth/auth.service';
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
            const adminPassword: unknown = req.body.password;
            let accessToken: unknown = req.body.token;

            const authenticated = await this.authService.validatePassword(adminPassword);
            const authorized = await this.authService.validateToken(accessToken);

            if (authenticated && !authorized) {
                accessToken = await this.authService.generateAccessToken();
            }

            res.status(authenticated ? httpStatus.OK : httpStatus.FORBIDDEN).json({ token: accessToken });
        });

        this.router.post('/token', async (req: Request, res: Response) => {
            const accessToken: unknown = req.body.token;
            const authorized = await this.authService.validateToken(accessToken);
            res.status(authorized ? httpStatus.OK : httpStatus.UNAUTHORIZED).json({ authorized });
        });
    }
}
