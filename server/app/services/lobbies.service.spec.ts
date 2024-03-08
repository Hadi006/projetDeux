import { DatabaseService } from './database.service';
import { LobbiesService } from './lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('LobbiesService', () => {
    const MOCK_LOBBY: LobbyData = {
        id: '1',
        players: [],
        quiz: { id: '1', title: 'Math', visible: true, description: 'Math quiz', duration: 5, lastModification: new Date(), questions: [] },
        started: false,
    };

    let lobbiesService: LobbiesService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        databaseServiceStub = createStubInstance(DatabaseService);
        lobbiesService = new LobbiesService(databaseServiceStub);
    });

    it('should return all lobbies', async () => {
        const lobbies = new Array(3).fill(MOCK_LOBBY);
        databaseServiceStub.get.resolves(lobbies);
        const result = await lobbiesService.getLobbies();
        expect(result).to.deep.equal(lobbies);
    });

    it('should return a lobby', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const result = await lobbiesService.getLobby(MOCK_LOBBY.id);
        expect(result).to.deep.equal(MOCK_LOBBY);
    });

    it('should add a lobby', async () => {
        databaseServiceStub.get.resolves([]);
        const result = await lobbiesService.addLobby(MOCK_LOBBY);
        expect(result).to.equal(true);
        expect(databaseServiceStub.add.calledWith('lobbies', MOCK_LOBBY)).to.equal(true);
    });

    it('should not add a lobby', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const result = await lobbiesService.addLobby(MOCK_LOBBY);
        expect(result).to.equal(false);
        expect(databaseServiceStub.add.called).to.equal(false);
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
