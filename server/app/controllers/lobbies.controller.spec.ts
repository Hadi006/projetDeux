import { Application } from '@app/app';
import { LobbiesService } from '@app/services/lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { expect } from 'chai';
import httpStatus from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('LobbyController', () => {
    const MOCK_LOBBIES: LobbyData[] = [
        {
            id: '1',
            players: [],
            quiz: { id: '1', title: 'Math', visible: true, description: 'Math quiz', duration: 5, lastModification: new Date(), questions: [] },
            started: false,
        },
        {
            id: '2',
            players: [],
            quiz: { id: '2', title: 'Math', visible: true, description: 'Math quiz', duration: 5, lastModification: new Date(), questions: [] },
            started: false,
        },
    ];
    const PARAM_ID = '1';

    let lobbiesServiceStub: SinonStubbedInstance<LobbiesService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        lobbiesServiceStub = createStubInstance(LobbiesService);
        const app = Container.get(Application);
        Object.defineProperty(app['lobbyController'], 'lobbiesService', { value: lobbiesServiceStub });
        expressApp = app.app;
    });

    it('GET / should return lobbies from lobbies service', async () => {
        lobbiesServiceStub.getLobbies.resolves([...MOCK_LOBBIES]);
        return supertest(expressApp)
            .get('/api/lobbies')
            .expect(httpStatus.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(MOCK_LOBBIES);
            });
    });

    it('GET / should return empty array', async () => {
        lobbiesServiceStub.getLobbies.resolves([]);
        return supertest(expressApp)
            .get('/api/lobbies')
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(response.body).to.deep.equal([]);
            });
    });
});
