import { Application } from '@app/app';
import { LobbiesService } from '@app/services/lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { expect } from 'chai';
import httpStatus from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('LobbyController', () => {
    const MOCK_LOBBIES: LobbyData = [
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
});
