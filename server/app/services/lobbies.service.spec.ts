import { LOBBY_ID_MAX, NEW_PLAYER } from '@common/constant';
import { DatabaseService } from './database.service';
import { LobbiesService } from './lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { Answer, Question, Quiz } from '@common/quiz';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Player } from '@common/player';

describe('LobbiesService', () => {
    const MOCK_ANSWERS: Answer[] = [
        {
            text: 'Answer 1',
            isCorrect: true,
        },
        {
            text: 'Answer 2',
            isCorrect: false,
        },
    ];

    const MOCK_QUESTION: Question = {
        id: '1',
        text: 'Question',
        type: 'QCM',
        points: 1,
        lastModification: new Date(),
        choices: [...MOCK_ANSWERS],
    };

    const MOCK_QUIZ: Quiz = {
        id: '1',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 5,
        lastModification: new Date(),
        questions: [JSON.parse(JSON.stringify(MOCK_QUESTION))],
    };

    const MOCK_LOBBY: LobbyData = {
        id: '1',
        players: [],
        quiz: JSON.parse(JSON.stringify(MOCK_QUIZ)),
        locked: false,
    };

    let lobbiesService: LobbiesService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        databaseServiceStub = createStubInstance(DatabaseService);
        lobbiesService = new LobbiesService(databaseServiceStub);
    });

    it('should return lobbies', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const result = await lobbiesService.getLobbies();
        expect(result).to.deep.equal([MOCK_LOBBY]);
    });

    it('should return a lobby', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const result = await lobbiesService.getLobby(MOCK_LOBBY.id);
        expect(result).to.deep.equal(MOCK_LOBBY);
    });

    it('should create a lobby', async () => {
        stub(lobbiesService, 'getLobbies').resolves([]);
        const result = await lobbiesService.createLobby(JSON.parse(JSON.stringify(MOCK_QUIZ)));
        expect(result.quiz).to.deep.equal(MOCK_LOBBY.quiz);
        expect(databaseServiceStub.add.called).to.equal(true);
    });

    it('should not create a lobby', async () => {
        stub(lobbiesService, 'getLobbies').resolves(new Array(LOBBY_ID_MAX).fill(MOCK_LOBBY));
        const result = await lobbiesService.createLobby(MOCK_QUIZ);
        expect(result).to.equal(undefined);
        expect(databaseServiceStub.add.called).to.equal(false);
    });

    it('should generate a new lobby id', async () => {
        stub(lobbiesService, 'getLobbies').resolves([MOCK_LOBBY]);
        const result = await lobbiesService.createLobby(MOCK_QUIZ);
        expect(result.id).to.not.equal(MOCK_LOBBY.id);
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

    it('should check lobby availability', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const result = await lobbiesService.checkLobbyAvailability(MOCK_LOBBY.id);
        expect(result).to.equal('');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
    });

    it('should return invalid lobby id', async () => {
        databaseServiceStub.get.resolves([]);
        const result = await lobbiesService.checkLobbyAvailability(MOCK_LOBBY.id);
        expect(result).to.equal('Le NIP est invalide');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
    });

    it('should return locked lobby', async () => {
        databaseServiceStub.get.resolves([{ ...MOCK_LOBBY, locked: true }]);
        const result = await lobbiesService.checkLobbyAvailability(MOCK_LOBBY.id);
        expect(result).to.equal('La partie est verouillée');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
    });

    it('should add a player', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        const result = await lobbiesService.addPlayer(MOCK_LOBBY.id, 'Player');
        expect(result.error).to.equal('');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.calledWith({ ...MOCK_LOBBY, players: [result.player] })).to.equal(true);
    });

    it('should not add a player if lobby is invalid', async () => {
        databaseServiceStub.get.resolves([]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        const result = await lobbiesService.addPlayer(MOCK_LOBBY.id, 'Player');
        expect(result.error).to.equal('Le NIP est invalide');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if lobby is locked', async () => {
        databaseServiceStub.get.resolves([{ ...MOCK_LOBBY, locked: true }]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        const result = await lobbiesService.addPlayer(MOCK_LOBBY.id, 'Player');
        expect(result.error).to.equal('La partie est verrouillée');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is already taken', async () => {
        databaseServiceStub.get.resolves([{ ...MOCK_LOBBY, players: [{ name: 'Player' }] }]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        const result = await lobbiesService.addPlayer(MOCK_LOBBY.id, 'Player');
        expect(result.error).to.equal('Ce nom est déjà utilisé');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is organizer', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        const result = await lobbiesService.addPlayer(MOCK_LOBBY.id, 'Organisateur');
        expect(result.error).to.equal('Pseudo interdit');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is empty', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        const result = await lobbiesService.addPlayer(MOCK_LOBBY.id, '        ');
        expect(result.error).to.equal("Pseudo vide n'est pas permis");
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should update a player', async () => {
        const player: Player = JSON.parse(JSON.stringify(NEW_PLAYER));
        stub(lobbiesService, 'getLobby').resolves({ ...MOCK_LOBBY, players: [NEW_PLAYER] });
        player.isCorrect = true;
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updatePlayer(MOCK_LOBBY.id, player);
        expect(updateStub.calledWith({ ...MOCK_LOBBY, players: [player] })).to.equal(true);
    });

    it('should not update a player if lobby is invalid', async () => {
        stub(lobbiesService, 'getLobby').resolves(undefined);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updatePlayer(MOCK_LOBBY.id, NEW_PLAYER);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update a player if player does not exist', async () => {
        stub(lobbiesService, 'getLobby').resolves(MOCK_LOBBY);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updatePlayer(MOCK_LOBBY.id, NEW_PLAYER);
        expect(updateStub.calledWith({ ...MOCK_LOBBY })).to.equal(true);
    });

    it('should update scores', async () => {
        const testPlayers: Player[] = [JSON.parse(JSON.stringify(NEW_PLAYER)), JSON.parse(JSON.stringify(NEW_PLAYER))];
        const wrongQuestionAnswer: Question = JSON.parse(JSON.stringify(MOCK_QUESTION));
        wrongQuestionAnswer.choices[0].isCorrect = false;
        testPlayers[0].questions.push(JSON.parse(JSON.stringify(MOCK_QUESTION)));
        testPlayers[1].questions.push({ ...wrongQuestionAnswer });
        const testLobby: LobbyData = { ...MOCK_LOBBY, players: testPlayers };
        databaseServiceStub.get.resolves([testLobby]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updateScores(MOCK_LOBBY.id, 0);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(MOCK_QUESTION.points);
        expect(testPlayers[0].isCorrect).to.equal(true);
        expect(testPlayers[1].score).to.equal(0);
        expect(testPlayers[1].isCorrect).to.equal(false);
    });

    it('should not update scores if lobby is invalid', async () => {
        databaseServiceStub.get.resolves([]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updateScores(MOCK_LOBBY.id, 0);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update scores if quiz is invalid', async () => {
        databaseServiceStub.get.resolves([{ ...MOCK_LOBBY, quiz: undefined }]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updateScores(MOCK_LOBBY.id, 0);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update scores if question is invalid', async () => {
        databaseServiceStub.get.resolves([MOCK_LOBBY]);
        const updateStub = stub(lobbiesService, 'updateLobby').resolves(true);
        await lobbiesService.updateScores(MOCK_LOBBY.id, 1);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: MOCK_LOBBY.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });
});
