import { Application } from '@app/app';
import { GameService } from '@app/services/game/game.service';
import { TEST_GAME_DATA } from '@common/constant';
import { Game } from '@common/game';
import { expect } from 'chai';
import httpStatus from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameBankController', () => {
    let expressApp: Express.Application;
    let gameServiceStub: SinonStubbedInstance<GameService>;
    let testGames: Game[];

    before(() => {
        gameServiceStub = createStubInstance(GameService);
        const app = Container.get(Application);
        expressApp = app.app;
        Object.defineProperty(app['gameBankController'], 'gameService', { value: gameServiceStub });
        testGames = JSON.parse(
            JSON.stringify([
                { ...TEST_GAME_DATA, ended: true },
                { ...TEST_GAME_DATA, ended: false },
            ]),
        );
    });

    it('GET / should return a list of ended games', async () => {
        gameServiceStub.getGames.resolves(testGames);

        const response = await supertest(expressApp).get('/api/games');

        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body).to.deep.equal([testGames[0]]);
    });

    it('GET / should return an empty list if there are no games', async () => {
        gameServiceStub.getGames.resolves(null);

        const response = await supertest(expressApp).get('/api/games');

        expect(response.status).to.equal(httpStatus.NOT_FOUND);
        expect(response.body).to.deep.equal([]);
        return;
    });

    it('DELETE / should delete all ended games', async () => {
        await supertest(expressApp).delete('/api/games');

        return expect(gameServiceStub.deleteEndedGames.calledOnce).to.be.true;
    });

    it('DELETE /:pin should delete a game', async () => {
        const pin = '1234';

        await supertest(expressApp).delete(`/api/games/${pin}`);

        return expect(gameServiceStub.deleteGame.calledOnceWith(pin)).to.be.true;
    });
});
