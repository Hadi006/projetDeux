import { Server } from '@app/server';
import { GameController } from '@app/controllers/game.controller';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore, spy, stub } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { GameService } from '@app/services/game.service';
import { Question, Quiz } from '@common/quiz';
import { Game } from '@common/game';
import { NEW_PLAYER, TEST_GAME_DATA, TEST_QUESTIONS, TEST_QUIZZES } from '@common/constant';

describe('GameController', () => {
    let service: GameController;
    let gameServiceStub: SinonStubbedInstance<GameService>;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';

    let testQuestion: Question;
    let testQuiz: Quiz;
    let testGame: Game;

    const RESPONSE_DELAY = 200;

    beforeEach(async () => {
        testQuestion = JSON.parse(JSON.stringify(TEST_QUESTIONS[0]));
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));

        gameServiceStub = createStubInstance(GameService);
        Container.set(GameService, gameServiceStub);
        server = Container.get(Server);
        server.init();
        service = server['gameController'];
        clientSocket = ioClient(urlString);
        stub(console, 'log');
    });

    afterEach(() => {
        clientSocket.close();
        service['sio'].close();
        restore();
    });

    it('should create a game', (done) => {
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testQuiz, (ack: Game | null) => {
            expect(ack.quiz).to.deep.equal(JSON.parse(JSON.stringify(testQuiz)));
            expect(gameServiceStub.createGame.called).to.equal(true);
            done();
        });
    });

    it('should not create a game', (done) => {
        gameServiceStub.createGame.resolves(null);
        clientSocket.emit('create-game', testQuiz, (ack: Game | null) => {
            expect(ack).to.equal(null);
            expect(gameServiceStub.createGame.called).to.equal(true);
            done();
        });
    });

    it('should join a game', (done) => {
        gameServiceStub.checkGameAvailability.resolves('');
        clientSocket.emit('join-game', testGame.pin, (ack: string) => {
            expect(ack).to.equal('');
            expect(gameServiceStub.checkGameAvailability.calledWith(testGame.pin)).to.equal(true);
            done();
        });
    });

    it('should not join a game', (done) => {
        gameServiceStub.checkGameAvailability.resolves('Error');
        clientSocket.emit('join-game', testGame.pin, (ack: string) => {
            expect(ack).to.equal('Error');
            expect(gameServiceStub.checkGameAvailability.calledWith(testGame.pin)).to.equal(true);
            done();
        });
    });

    it('should delete a game', (done) => {
        gameServiceStub.deleteGame.resolves(true);
        clientSocket.emit('delete-game', testGame.pin);

        setTimeout(() => {
            expect(gameServiceStub.deleteGame.calledWith(testGame.pin)).to.equal(true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should broadcast a start game if in the game', (done) => {
        const countdown = 5;
        gameServiceStub.createGame.resolves(testGame);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.on('start-game', (response) => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                expect(response).to.equal(countdown);
                done();
            });
            clientSocket.emit('start-game', { pin: testGame.pin, countdown });
        });
    });

    it('should add a player to the game', (done) => {
        const playerName = 'John Doe';
        const result = {
            player: { ...NEW_PLAYER, name: playerName },
            players: [playerName],
            error: '',
        };
        gameServiceStub.addPlayer.resolves(result);
        clientSocket.emit('create-player', { pin: testGame.pin, playerName }, (ack: typeof result) => {
            expect(ack).to.deep.equal(result);
            expect(gameServiceStub.addPlayer.calledWith(testGame.pin, playerName)).to.equal(true);
            done();
        });
    });

    it('should not add a player if there is an error', (done) => {
        const playerName = 'John Doe';
        const result = {
            player: { ...NEW_PLAYER, name: playerName },
            players: [playerName],
            error: 'Error',
        };
        gameServiceStub.addPlayer.resolves(result);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-player', { pin: testGame.pin, playerName }, (ack: typeof result) => {
            expect(ack).to.deep.equal(result);
            expect(gameServiceStub.addPlayer.calledWith(testGame.pin, playerName)).to.equal(true);
            expect(toSpy.called).to.equal(false);
            done();
        });
    });

    it('should broadcast a next question', (done) => {
        const question = JSON.parse(JSON.stringify(testQuestion));
        const countdown = 5;
        gameServiceStub.createGame.resolves(testGame);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.on('next-question', (response) => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                expect(response).to.deep.equal({ question, countdown });
                done();
            });
            clientSocket.emit('next-question', { pin: testGame.pin, question, countdown });
        });
    });

    it('should update player', (done) => {
        clientSocket.emit('update-player', { pin: testGame.pin, player: testGame.players[0] });
        setTimeout(() => {
            expect(gameServiceStub.updatePlayer.calledWith(testGame.pin, testGame.players[0])).to.equal(true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should update scores', (done) => {
        const questionIndex = 0;
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testGame.quiz, () => {
            gameServiceStub.updateScores.resolves();
            gameServiceStub.getGame.resolves(testGame);
            let count = 0;
            clientSocket.on('new-score', (response) => {
                if (response.name === testGame.players[0].name) {
                    expect(response).to.deep.equal(testGame.players[0]);
                }

                if (response.name === testGame.players[1].name) {
                    expect(response).to.deep.equal(testGame.players[1]);
                }

                if (++count === testGame.players.length) {
                    done();
                }
            });
            clientSocket.emit('update-scores', { pin: testGame.pin, questionIndex });
        });
    });

    it('should confirm player answer', (done) => {
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testGame.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            gameServiceStub.updatePlayer.resolves();
            clientSocket.emit('confirm-player-answer', { pin: testGame.pin, player: testGame.players[0] });
            setTimeout(() => {
                expect(gameServiceStub.updatePlayer.called).to.equal(true);
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should end question', (done) => {
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testGame.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            clientSocket.emit('end-question', testGame.pin);
            setTimeout(() => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should answer', (done) => {
        const playerName = 'John Doe';
        const answer = { playerName, choices: [true, false, false, false] };
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testGame.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            clientSocket.emit('answer', { pin: testGame.pin, answer });
            setTimeout(() => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should end game', (done) => {
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testGame.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            clientSocket.emit('end-game', testGame.pin);
            setTimeout(() => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });
});
