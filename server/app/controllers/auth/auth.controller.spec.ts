import { Application } from '@app/app';
import { AuthService } from '@app/services/auth/auth.service';
import { expect } from 'chai';
import httpStatus from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('AuthController', () => {
    let authServiceStub: SinonStubbedInstance<AuthService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        authServiceStub = createStubInstance(AuthService);
        const app = Container.get(Application);
        Object.defineProperty(app['authController'], 'authService', { value: authServiceStub });
        expressApp = app.app;
    });

    it('POST /password should return token from auth service', async () => {
        authServiceStub.validatePassword.resolves(true);
        authServiceStub.validateToken.resolves(false);
        const token = { id: 'id', expirationDate: 0 };
        authServiceStub.generateAccessToken.resolves(token);

        return supertest(expressApp)
            .post('/api/auth/password')
            .send({ password: 'password', token: 'token' })
            .expect(httpStatus.OK)
            .then((response) => {
                expect(authServiceStub.validatePassword.calledWith('password')).to.equal(true);
                expect(authServiceStub.validateToken.calledWith('token')).to.equal(true);
                expect(authServiceStub.generateAccessToken.called).to.equal(true);
                expect(response.body.token).to.deep.equal(token);
            });
    });

    it('POST /password should return 403 when password is invalid', async () => {
        authServiceStub.validatePassword.resolves(false);

        return supertest(expressApp)
            .post('/api/auth/password')
            .send({ password: 'password', token: 'token' })
            .expect(httpStatus.FORBIDDEN)
            .then((response) => {
                expect(authServiceStub.validatePassword.calledWith('password')).to.equal(true);
                expect(authServiceStub.validateToken.calledWith('token')).to.equal(true);
                expect(authServiceStub.generateAccessToken.called).to.equal(false);
                expect(response.body.token).to.equal('token');
            });
    });

    it('POST /token should return authorized from auth service', async () => {
        authServiceStub.validateToken.resolves(true);

        return supertest(expressApp)
            .post('/api/auth/token')
            .send({ token: 'token' })
            .expect(httpStatus.OK)
            .then((response) => {
                expect(authServiceStub.validateToken.calledOnce).to.equal(true);
                expect(response.body.authorized).to.equal(true);
            });
    });

    it('POST /token should return 401 when token is invalid', async () => {
        authServiceStub.validateToken.resolves(false);

        return supertest(expressApp)
            .post('/api/auth/token')
            .send({ token: 'token' })
            .expect(httpStatus.UNAUTHORIZED)
            .then(() => {
                expect(authServiceStub.validateToken.calledOnce).to.equal(true);
                expect(authServiceStub.generateAccessToken.called).to.equal(false);
            });
    });
});
