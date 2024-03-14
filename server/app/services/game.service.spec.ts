import { GOOD_ANSWER_BONUS, LOBBY_ID_MAX, NEW_PLAYER, TEST_LOBBY_DATA, TEST_PLAYERS, TEST_QUESTIONS, TEST_QUIZZES } from '@common/constant';
import { DatabaseService } from './database.service';
import { GameService } from '@app/services/game.service';
import { LobbyData } from '@common/lobby-data';
import { Question, Quiz } from '@common/quiz';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Player } from '@common/player';

describe('LobbiesService', () => {
    let testQuestion: Question;
    let testQuiz: Quiz;
    let testLobbyData: LobbyData;

    let gameService: GameService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        testQuestion = JSON.parse(JSON.stringify(TEST_QUESTIONS[0]));
        testQuiz = JSON.parse(JSON.stringify({ ...TEST_QUIZZES[0], questions: [testQuestion] }));
        testLobbyData = JSON.parse(JSON.stringify({ ...TEST_LOBBY_DATA, quiz: testQuiz }));

        databaseServiceStub = createStubInstance(DatabaseService);
        gameService = new GameService(databaseServiceStub);
    });

    it('should return lobbies', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const result = await gameService.getGames();
        expect(result).to.deep.equal([testLobbyData]);
    });

    it('should return a lobby', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const result = await gameService.getGame(testLobbyData.id);
        expect(result).to.deep.equal(testLobbyData);
    });

    it('should create a lobby', async () => {
        stub(gameService, 'getGames').resolves([]);
        const result = await gameService.createGame(JSON.parse(JSON.stringify(testQuiz)));
        expect(result.quiz).to.deep.equal(testLobbyData.quiz);
        expect(databaseServiceStub.add.called).to.equal(true);
    });

    it('should not create a lobby', async () => {
        stub(gameService, 'getGames').resolves(new Array(LOBBY_ID_MAX).fill(testLobbyData));
        const result = await gameService.createGame(testQuiz);
        expect(result).to.equal(undefined);
        expect(databaseServiceStub.add.called).to.equal(false);
    });

    it('should generate a new lobby id', async () => {
        stub(gameService, 'getGames').resolves([testLobbyData]);
        const result = await gameService.createGame(testQuiz);
        expect(result.id).to.not.equal(testLobbyData.id);
        expect(databaseServiceStub.add.called).to.equal(true);
    });

    it('should update a lobby', async () => {
        databaseServiceStub.update.resolves(true);
        const result = await gameService.updateLobby(testLobbyData);
        expect(result).to.equal(true);
        expect(databaseServiceStub.update.calledWith('lobbies', { id: testLobbyData.id }, [{ $set: testLobbyData }])).to.equal(true);
    });

    it('should not update a lobby', async () => {
        databaseServiceStub.update.resolves(false);
        const result = await gameService.updateLobby(testLobbyData);
        expect(result).to.equal(false);
        expect(databaseServiceStub.update.calledWith('lobbies', { id: testLobbyData.id }, [{ $set: testLobbyData }])).to.equal(true);
    });

    it('should delete a lobby', async () => {
        databaseServiceStub.delete.resolves(true);
        const result = await gameService.deleteLobby(testLobbyData.id);
        expect(result).to.equal(true);
        expect(databaseServiceStub.delete.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
    });

    it('should not delete a lobby', async () => {
        databaseServiceStub.delete.resolves(false);
        const result = await gameService.deleteLobby(testLobbyData.id);
        expect(result).to.equal(false);
        expect(databaseServiceStub.delete.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
    });

    it('should check lobby availability', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const result = await gameService.checkGameAvailability(testLobbyData.id);
        expect(result).to.equal('');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
    });

    it('should return invalid lobby id', async () => {
        databaseServiceStub.get.resolves([]);
        const result = await gameService.checkGameAvailability(testLobbyData.id);
        expect(result).to.equal('Le NIP est invalide');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
    });

    it('should return locked lobby', async () => {
        databaseServiceStub.get.resolves([{ ...testLobbyData, locked: true }]);
        const result = await gameService.checkGameAvailability(testLobbyData.id);
        expect(result).to.equal('La partie est verouillée');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
    });

    it('should add a player', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        const result = await gameService.addPlayer(testLobbyData.id, 'Player');
        expect(result.error).to.equal('');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.calledWith({ ...testLobbyData })).to.equal(true);
    });

    it('should not add a player if lobby is invalid', async () => {
        databaseServiceStub.get.resolves([]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        const result = await gameService.addPlayer(testLobbyData.id, 'Player');
        expect(result.error).to.equal('Le NIP est invalide');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if lobby is locked', async () => {
        databaseServiceStub.get.resolves([{ ...testLobbyData, locked: true }]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        const result = await gameService.addPlayer(testLobbyData.id, 'Player');
        expect(result.error).to.equal('La partie est verrouillée');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is already taken', async () => {
        databaseServiceStub.get.resolves([{ ...testLobbyData, players: [{ name: 'Player' }] }]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        const result = await gameService.addPlayer(testLobbyData.id, 'Player');
        expect(result.error).to.equal('Ce nom est déjà utilisé');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is organizer', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        const result = await gameService.addPlayer(testLobbyData.id, 'Organisateur');
        expect(result.error).to.equal('Pseudo interdit');
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is empty', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        const result = await gameService.addPlayer(testLobbyData.id, '        ');
        expect(result.error).to.equal("Pseudo vide n'est pas permis");
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should update a player', async () => {
        const player: Player = JSON.parse(JSON.stringify(NEW_PLAYER));
        stub(gameService, 'getGame').resolves({ ...testLobbyData, players: [NEW_PLAYER] });
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updatePlayer(testLobbyData.id, player);
        expect(updateStub.calledWith({ ...testLobbyData, players: [player] })).to.equal(true);
    });

    it('should not update a player if lobby is invalid', async () => {
        stub(gameService, 'getGame').resolves(undefined);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updatePlayer(testLobbyData.id, NEW_PLAYER);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update a player if player does not exist', async () => {
        stub(gameService, 'getGame').resolves(testLobbyData);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updatePlayer(testLobbyData.id, NEW_PLAYER);
        expect(updateStub.calledWith({ ...testLobbyData })).to.equal(true);
    });

    it('should update scores', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        const wrongQuestionAnswer: Question = JSON.parse(JSON.stringify(testQuestion));
        wrongQuestionAnswer.choices[0].isCorrect = !wrongQuestionAnswer.choices[0].isCorrect;
        testPlayers[0].questions[0] = JSON.parse(JSON.stringify(testQuestion));
        testPlayers[1].questions[0] = JSON.parse(JSON.stringify(wrongQuestionAnswer));
        const testLobby: LobbyData = { ...testLobbyData, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(testLobby);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updateScores(testLobby.id, 0);
        expect(getStub.calledWith(testLobby.id)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points);
        expect(testPlayers[1].score).to.equal(0);
    });

    it('should not update scores if lobby is invalid', async () => {
        databaseServiceStub.get.resolves([]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updateScores(testLobbyData.id, 0);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update scores if quiz is invalid', async () => {
        databaseServiceStub.get.resolves([{ ...testLobbyData, quiz: undefined }]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updateScores(testLobbyData.id, 0);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update scores if question is invalid', async () => {
        databaseServiceStub.get.resolves([testLobbyData]);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updateScores(testLobbyData.id, 1);
        expect(databaseServiceStub.get.calledWith('lobbies', { id: testLobbyData.id })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should give bonus points if player is the first to answer correctly', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        testPlayers[0].questions[0].lastModification = new Date('2020-01-01T00:00:00Z');
        const testLobby: LobbyData = { ...testLobbyData, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(testLobby);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updateScores(testLobby.id, 0);
        expect(getStub.calledWith(testLobby.id)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points + testQuestion.points * GOOD_ANSWER_BONUS);
        expect(testPlayers[0].fastestResponseCount).to.equal(1);
        expect(testPlayers[1].score).to.equal(testQuestion.points);
    });

    it('should give points if there is only 1 player and he answers correctly', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify([TEST_PLAYERS[0]]));
        const testLobby: LobbyData = { ...testLobbyData, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(testLobby);
        const updateStub = stub(gameService, 'updateLobby').resolves(true);
        await gameService.updateScores(testLobby.id, 0);
        expect(getStub.calledWith(testLobby.id)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points + testQuestion.points * GOOD_ANSWER_BONUS);
        expect(testPlayers[0].fastestResponseCount).to.equal(1);
    });
});
