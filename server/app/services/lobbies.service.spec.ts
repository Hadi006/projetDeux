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
        await lobbiesService.addLobby(MOCK_LOBBY);
        expect(databaseServiceStub.add.calledWith('lobbies', MOCK_LOBBY)).to.equal(true);
    });
});
