import { GOOD_ANSWER_BONUS, GAME_ID_MAX, NEW_PLAYER, TEST_GAME_DATA, TEST_PLAYERS, TEST_QUESTIONS, TEST_QUIZZES } from '@common/constant';
import { DatabaseService } from './database.service';
import { GameService } from '@app/services/game.service';
import { Game } from '@common/game';
import { Question, Quiz } from '@common/quiz';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Player } from '@common/player';

describe('GameService', () => {
    let testQuestion: Question;
    let testQuiz: Quiz;
    let testGame: Game;

    let gameService: GameService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        testQuestion = JSON.parse(JSON.stringify(TEST_QUESTIONS[0]));
        testQuiz = JSON.parse(JSON.stringify({ ...TEST_QUIZZES[0], questions: [testQuestion] }));
        testGame = JSON.parse(JSON.stringify({ ...TEST_GAME_DATA, quiz: testQuiz }));

        databaseServiceStub = createStubInstance(DatabaseService);
        gameService = new GameService(databaseServiceStub);
    });

    it('should return games', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const result = await gameService.getGames();
        expect(result).to.deep.equal([testGame]);
    });

    it('should return a game', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const result = await gameService.getGame(testGame.pin);
        expect(result).to.deep.equal(testGame);
    });

    it('should create a game', async () => {
        stub(gameService, 'getGames').resolves([]);
        const result = await gameService.createGame(JSON.parse(JSON.stringify(testQuiz)));
        expect(result.quiz).to.deep.equal(testGame.quiz);
        expect(databaseServiceStub.add.called).to.equal(true);
    });

    it('should not create a game', async () => {
        stub(gameService, 'getGames').resolves(new Array(GAME_ID_MAX).fill(testGame));
        const result = await gameService.createGame(testQuiz);
        expect(result).to.equal(undefined);
        expect(databaseServiceStub.add.called).to.equal(false);
    });

    it('should generate a new game pin', async () => {
        stub(gameService, 'getGames').resolves([testGame]);
        const result = await gameService.createGame(testQuiz);
        expect(result.pin).to.not.equal(testGame.pin);
        expect(databaseServiceStub.add.called).to.equal(true);
    });

    it('should update a game', async () => {
        databaseServiceStub.update.resolves(true);
        const result = await gameService.updateGame(testGame);
        expect(result).to.equal(true);
        expect(databaseServiceStub.update.calledWith('games', { pin: testGame.pin }, [{ $set: testGame }])).to.equal(true);
    });

    it('should not update a game', async () => {
        databaseServiceStub.update.resolves(false);
        const result = await gameService.updateGame(testGame);
        expect(result).to.equal(false);
        expect(databaseServiceStub.update.calledWith('games', { pin: testGame.pin }, [{ $set: testGame }])).to.equal(true);
    });

    it('should delete a game', async () => {
        databaseServiceStub.delete.resolves(true);
        const result = await gameService.deleteGame(testGame.pin);
        expect(result).to.equal(true);
        expect(databaseServiceStub.delete.calledWith('games', { pin: testGame.pin })).to.equal(true);
    });

    it('should not delete a game', async () => {
        databaseServiceStub.delete.resolves(false);
        const result = await gameService.deleteGame(testGame.pin);
        expect(result).to.equal(false);
        expect(databaseServiceStub.delete.calledWith('games', { pin: testGame.pin })).to.equal(true);
    });

    it('should check game availability', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const result = await gameService.checkGameAvailability(testGame.pin);
        expect(result).to.equal('');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
    });

    it('should return invalid game pin', async () => {
        databaseServiceStub.get.resolves([]);
        const result = await gameService.checkGameAvailability(testGame.pin);
        expect(result).to.equal('Le NIP est invalide');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
    });

    it('should return locked game', async () => {
        databaseServiceStub.get.resolves([{ ...testGame, locked: true }]);
        const result = await gameService.checkGameAvailability(testGame.pin);
        expect(result).to.equal('La partie est verouillée');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
    });

    it('should add a player', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, 'Player');
        expect(result.error).to.equal('');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.calledWith({ ...testGame })).to.equal(true);
    });

    it('should not add a player if game is invalid', async () => {
        databaseServiceStub.get.resolves([]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, 'Player');
        expect(result.error).to.equal('Le NIP est invalide');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if game is locked', async () => {
        databaseServiceStub.get.resolves([{ ...testGame, locked: true }]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, 'Player');
        expect(result.error).to.equal('La partie est verrouillée');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is already taken', async () => {
        databaseServiceStub.get.resolves([{ ...testGame, players: [{ name: 'Player' }] }]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, 'Player');
        expect(result.error).to.equal('Ce nom est déjà utilisé');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is organizer', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, 'Organisateur');
        expect(result.error).to.equal('Pseudo interdit');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is empty', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, '        ');
        expect(result.error).to.equal("Pseudo vide n'est pas permis");
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not add a player if name is banned', async () => {
        databaseServiceStub.get.resolves([{ ...testGame, bannedNames: ['banned'] }]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        const result = await gameService.addPlayer(testGame.pin, 'Banned');
        expect(result.error).to.equal('Ce nom est banni');
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should update a player', async () => {
        const player: Player = JSON.parse(JSON.stringify(NEW_PLAYER));
        stub(gameService, 'getGame').resolves({ ...testGame, players: [NEW_PLAYER] });
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updatePlayer(testGame.pin, player);
        expect(updateStub.calledWith({ ...testGame, players: [player] })).to.equal(true);
    });

    it('should not update a player if game is invalid', async () => {
        stub(gameService, 'getGame').resolves(undefined);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updatePlayer(testGame.pin, NEW_PLAYER);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update a player if player does not exist', async () => {
        stub(gameService, 'getGame').resolves(testGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updatePlayer(testGame.pin, NEW_PLAYER);
        expect(updateStub.calledWith({ ...testGame })).to.equal(true);
    });

    it('should update scores', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        const wrongQuestionAnswer: Question = JSON.parse(JSON.stringify(testQuestion));
        wrongQuestionAnswer.choices[0].isCorrect = !wrongQuestionAnswer.choices[0].isCorrect;
        testPlayers[1].questions[0] = JSON.parse(JSON.stringify(wrongQuestionAnswer));
        const newGame: Game = { ...testGame, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(newGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(newGame.pin, 0);
        expect(getStub.calledWith(newGame.pin)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points + testQuestion.points * GOOD_ANSWER_BONUS);
        expect(testPlayers[1].score).to.equal(0);
    });

    it('should not update scores if game is invalid', async () => {
        databaseServiceStub.get.resolves([]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(testGame.pin, 0);
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update scores if quiz is invalid', async () => {
        databaseServiceStub.get.resolves([{ ...testGame, quiz: undefined }]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(testGame.pin, 0);
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should not update scores if question is invalid', async () => {
        databaseServiceStub.get.resolves([testGame]);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(testGame.pin, 1);
        expect(databaseServiceStub.get.calledWith('games', { pin: testGame.pin })).to.equal(true);
        expect(updateStub.called).to.equal(false);
    });

    it('should give bonus points if player is the first to answer correctly', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        testPlayers[0].questions[0].lastModification = new Date('2020-01-01T00:00:00Z');
        testPlayers[1].questions[0].lastModification = new Date('2020-01-01T00:00:01Z');
        const newGame: Game = { ...testGame, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(newGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(newGame.pin, 0);
        expect(getStub.calledWith(newGame.pin)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points + testQuestion.points * GOOD_ANSWER_BONUS);
        expect(testPlayers[0].fastestResponseCount).to.equal(1);
        expect(testPlayers[1].score).to.equal(testQuestion.points);
    });

    it('should give bonus points if the second player answers before the first one', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        testPlayers[0].questions[0].lastModification = new Date('2020-01-01T00:00:01Z');
        testPlayers[1].questions[0].lastModification = new Date('2020-01-01T00:00:00Z');
        const newGame: Game = { ...testGame, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(newGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(newGame.pin, 0);
        expect(getStub.calledWith(newGame.pin)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points);
        expect(testPlayers[0].fastestResponseCount).to.equal(0);
        expect(testPlayers[1].score).to.equal(testQuestion.points + testQuestion.points * GOOD_ANSWER_BONUS);
        expect(testPlayers[1].fastestResponseCount).to.equal(1);
    });

    it('should give points if there is only 1 player and he answers correctly', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify([TEST_PLAYERS[0]]));
        const newGame: Game = { ...testGame, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(newGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(newGame.pin, 0);
        expect(getStub.calledWith(newGame.pin)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points + testQuestion.points * GOOD_ANSWER_BONUS);
        expect(testPlayers[0].fastestResponseCount).to.equal(1);
    });

    it('should not give bonus points if multiple players answer correctly at the same time', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        testPlayers[0].questions[0].lastModification = new Date('2020-01-01T00:00:00Z');
        testPlayers[1].questions[0].lastModification = new Date('2020-01-01T00:00:00Z');
        const newGame: Game = { ...testGame, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(newGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(newGame.pin, 0);
        expect(getStub.calledWith(newGame.pin)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].score).to.equal(testQuestion.points);
        expect(testPlayers[0].fastestResponseCount).to.equal(0);
        expect(testPlayers[1].score).to.equal(testQuestion.points);
        expect(testPlayers[1].fastestResponseCount).to.equal(0);
    });

    it('should assign dates to players who did confirm', async () => {
        const testPlayers: Player[] = JSON.parse(JSON.stringify(TEST_PLAYERS));
        testPlayers[0].questions[0].lastModification = undefined;
        testPlayers[1].questions[0].lastModification = undefined;
        const newGame: Game = { ...testGame, players: testPlayers };
        const getStub = stub(gameService, 'getGame').resolves(newGame);
        const updateStub = stub(gameService, 'updateGame').resolves(true);
        await gameService.updateScores(newGame.pin, 0);
        expect(getStub.calledWith(newGame.pin)).to.equal(true);
        expect(updateStub.called).to.equal(true);
        expect(testPlayers[0].questions[0].lastModification).to.not.equal(undefined);
        expect(testPlayers[1].questions[0].lastModification).to.not.equal(undefined);
    });
});
