import { AuthService } from '@app/services/auth.service';
import { DatabaseService } from '@app/services/database.service';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('AuthService', () => {
    let authService: AuthService;
    let dataBaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        dataBaseServiceStub = createStubInstance(DatabaseService);
        authService = new AuthService(dataBaseServiceStub);
    });

    it('should return true for a correct password', async () => {
        const mockPassword = 'password';
        dataBaseServiceStub.get.resolves([{ password: mockPassword }]);
        const result = await authService.validatePassword(mockPassword);
        expect(result).to.equal(true);
    });

    it('should return false for an incorrect password', async () => {
        const mockPassword = 'password';
        dataBaseServiceStub.get.resolves([{ password: 'wrongPassword' }]);
        const result = await authService.validatePassword(mockPassword);
        expect(result).to.equal(false);
    });

    it('should return false if the password field is missing in the database', async () => {
        dataBaseServiceStub.get.resolves([{}]);
        const result = await authService.validatePassword('password');
        expect(result).to.equal(false);
    });

    it('should return false if the database returns null or undefined', async () => {
        dataBaseServiceStub.get.resolves([null]);
        let result = await authService.validatePassword('password');
        expect(result).to.equal(false);

        dataBaseServiceStub.get.resolves([undefined]);
        result = await authService.validatePassword('password');
        expect(result).to.equal(false);
    });

    it('should return false if it is not an object token', async () => {
        const result = await authService.validateToken('not a token');
        expect(result).to.equal(false);
    });

    it('should return false if token is not found or expired', async () => {
        dataBaseServiceStub.delete.resolves();
        dataBaseServiceStub.get.resolves([]);

        const token = { id: 'id', expirationDate: Date.now() };
        const result = await authService.validateToken(token);
        expect(result).to.equal(false);
        expect(dataBaseServiceStub.delete.calledOnce).to.equal(true);
    });

    it('should return true for a valid token', async () => {
        dataBaseServiceStub.delete.resolves();
        const token = { id: 'id', expirationDate: Date.now() };
        dataBaseServiceStub.get.resolves([token]);
        const result = await authService.validateToken(token);
        expect(result).to.equal(true);
    });

    it('should generate a token with the correct structure and expiration', async () => {
        const ONE_HOUR_MS = 3_600_000;
        const ONE_SECOND_MS = 1000;
        dataBaseServiceStub.add.resolves();
        const result = await authService.generateAccessToken();

        expect(result).to.have.property('id').that.is.a('string');
        expect(result).to.have.property('expirationDate').that.is.a('number');
        expect(result.expirationDate).to.be.closeTo(Date.now() + ONE_HOUR_MS, ONE_SECOND_MS);
        expect(dataBaseServiceStub.add.calledOnce).to.equal(true);
        expect(dataBaseServiceStub.add.calledWith('tokens', result)).to.equal(true);
    });
});
