import { DatabaseService } from './database.service';
import { LobbiesService } from './lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { Quiz } from '@common/quiz';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

describe('LobbiesService', () => {
    const MOCK_QUIZ: Quiz = {
        id: '1',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 5,
        lastModification: new Date(),
        questions: [],
    };

    const MOCK_LOBBY: LobbyData = {
        id: '1',
        players: [],
        quiz: MOCK_QUIZ,
        started: false,
    };

    let lobbiesService: LobbiesService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        databaseServiceStub = createStubInstance(DatabaseService);
        lobbiesService = new LobbiesService(databaseServiceStub);
    });

    it('should return a lobby', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const result = await lobbiesService.getLobby(MOCK_LOBBY.id);
        expect(result).to.deep.equal(MOCK_LOBBY);
    });

    it('should create a lobby', async () => {
        stub(lobbiesService, 'getLobby').resolves(undefined);
        const result = await lobbiesService.createLobby(MOCK_QUIZ);
        expect(result.quiz).to.deep.equal(MOCK_LOBBY.quiz);
        expect(databaseServiceStub.add.called).to.equal(true);
    });

    it('should update a lobby', async () => {
        databaseServiceStub.update.resolves(true);
        const result = await lobbiesService.updateLobby(MOCK_LOBBY);
        expect(result).to.equal(true);
        expect(databaseServiceStub.update.calledWith('lobbies', { id: MOCK_LOBBY.id }, [{ $set: MOCK_LOBBY }])).to.equal(true);
    });

    it('should not update a lobby', async () => {
        databaseServiceStub.update.resolves(false);
        const result = await lobbiesService.updateLobby(MOCK_LOBBY);
        expect(result).to.equal(false);
        expect(databaseServiceStub.update.calledWith('lobbies', { id: MOCK_LOBBY.id }, [{ $set: MOCK_LOBBY }])).to.equal(true);
    });

    it('should delete a lobby', async () => {
        databaseServiceStub.delete.resolves(true);
        const result = await lobbiesService.deleteLobby(MOCK_LOBBY.id);
        expect(result).to.equal(true);
        expect(databaseServiceStub.delete.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
    });

    it('should not delete a lobby', async () => {
        databaseServiceStub.delete.resolves(false);
        const result = await lobbiesService.deleteLobby(MOCK_LOBBY.id);
        expect(result).to.equal(false);
        expect(databaseServiceStub.delete.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
    });
});
