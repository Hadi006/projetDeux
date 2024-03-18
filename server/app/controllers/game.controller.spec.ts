import { Server } from '@app/server';
import { GameController } from '@app/controllers/game.controller';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore, spy, stub } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { GameService } from '@app/services/game.service';
import { Question, Quiz } from '@common/quiz';
import { Game } from '@common/game';
import { NEW_PLAYER, TEST_GAME_DATA, TEST_HISTOGRAM_DATA, TEST_PLAYERS, TEST_QUESTIONS, TEST_QUIZZES } from '@common/constant';
import { Player } from '@common/player';
import { HistogramData } from '@common/histogram-data';

describe('GameController', () => {
    let service: GameController;
    let gameServiceStub: SinonStubbedInstance<GameService>;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';

    let testQuestion: Question;
    let testQuiz: Quiz;
    let testHistogram: HistogramData;
    let testGame: Game;

    const RESPONSE_DELAY = 200;

    beforeEach(async () => {
        testQuestion = JSON.parse(JSON.stringify(TEST_QUESTIONS[0]));
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        testHistogram = JSON.parse(JSON.stringify(TEST_HISTOGRAM_DATA[0]));
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

    it('should delete a game', (done) => {
        gameServiceStub.deleteGame.resolves(true);
        const toSpy = spy(service['sio'], 'to');
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testQuiz, () => {
            clientSocket.on('game-deleted', () => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                done();
            });
        });
        clientSocket.emit('delete-game', testGame.pin);
    });

    it('should kick a player', (done) => {
        const name = TEST_PLAYERS[0].name;
        gameServiceStub.createGame.resolves(testGame);
        gameServiceStub.getGame.resolves(testGame);
        gameServiceStub.updateGame.resolves();
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.on('kicked', (response) => {
                const filteredPlayers = testGame.players.filter((player: Player) => player.name !== name);
                expect(gameServiceStub.getGame.calledWith(testGame.pin)).to.equal(true);
                expect(testGame.players).to.deep.equal(filteredPlayers);
                expect(testGame.bannedNames).to.deep.equal([name.toLowerCase()]);
                expect(gameServiceStub.updateGame.calledWith(testGame)).to.equal(true);
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                expect(response).to.equal(name);
                done();
            });

            clientSocket.emit('kick', { pin: testGame.pin, data: name });
        });
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
            clientSocket.emit('start-game', { pin: testGame.pin, data: countdown });
        });
    });

    it('should change lock state', (done) => {
        const lockState = true;
        gameServiceStub.getGame.resolves(testGame);
        gameServiceStub.createGame.resolves(testGame);
        gameServiceStub.updateGame.resolves();
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.emit('toggle-lock', { pin: testGame.pin, data: lockState });
            setTimeout(() => {
                expect(gameServiceStub.updateGame.calledWith({ ...testGame, locked: lockState })).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should add a player to the lobby', (done) => {
        const playerName = 'John Doe';
        const result = {
            player: { ...NEW_PLAYER, name: playerName },
            players: [playerName],
            gameTitle: testGame.quiz.title,
            error: '',
        };
        gameServiceStub.addPlayer.resolves(result);
        clientSocket.emit('join-game', { pin: testGame.pin, data: playerName }, (ack: typeof result) => {
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
            gameTitle: testGame.quiz.title,
            error: 'Error',
        };
        gameServiceStub.addPlayer.resolves(result);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('join-game', { pin: testGame.pin, data: playerName }, (ack: typeof result) => {
            expect(ack).to.deep.equal(result);
            expect(gameServiceStub.addPlayer.calledWith(testGame.pin, playerName)).to.equal(true);
            expect(toSpy.called).to.equal(false);
            done();
        });
    });

    it('should broadcast a player left and remove player from game', (done) => {
        const playerName = TEST_PLAYERS[0].name;
        gameServiceStub.getGame.resolves(testGame);
        gameServiceStub.createGame.resolves(testGame);
        gameServiceStub.updateGame.resolves();
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.on('player-left', (response) => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                expect(
                    gameServiceStub.updateGame.calledWith({ ...testGame, players: testGame.players.filter((player) => player.name !== playerName) }),
                ).to.equal(true);
                expect(response.players).to.deep.equal(testGame.players);
                done();
            });
            clientSocket.emit('player-leave', { pin: testGame.pin, data: playerName });
        });
    });

    it('should do nothing if game does not exist', (done) => {
        const playerName = TEST_PLAYERS[0].name;
        gameServiceStub.getGame.resolves(null);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('player-leave', { pin: testGame.pin, data: playerName });
        setTimeout(() => {
            expect(toSpy.called).to.equal(false);
            done();
        }, RESPONSE_DELAY);
    });

    it('should broadcast a question-changed', (done) => {
        const question = testQuestion;
        const histogram = testHistogram;
        const countdown = 5;
        gameServiceStub.createGame.resolves(testGame);
        gameServiceStub.getGame.resolves(testGame);
        gameServiceStub.updateGame.resolves();
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.on('question-changed', (response) => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                expect(response).to.deep.equal({ question, countdown });
                done();
            });
            clientSocket.emit('next-question', { pin: testGame.pin, data: { question, countdown, histogram } });
        });
    });

    it('should broadcast undefined question', (done) => {
        const countdown = 5;
        gameServiceStub.createGame.resolves(testGame);
        gameServiceStub.getGame.resolves(testGame);
        gameServiceStub.updateGame.resolves();
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-game', testGame.quiz, () => {
            clientSocket.on('question-changed', (response) => {
                expect(toSpy.calledWith(testGame.pin)).to.equal(true);
                expect(response).to.deep.equal({ countdown });
                done();
            });
            clientSocket.emit('next-question', { pin: testGame.pin, data: { countdown } });
        });
    });

    it('should update player and tell the host', (done) => {
        gameServiceStub.updatePlayer.resolves(TEST_HISTOGRAM_DATA[0]);
        gameServiceStub.getGame.resolves(testGame);
        const getStub = stub().returns(clientSocket);
        stub(service['sio'].sockets.sockets, 'get').callsFake(getStub);
        clientSocket.emit('update-player', { pin: testGame.pin, data: testGame.players[0] });
        setTimeout(() => {
            expect(gameServiceStub.updatePlayer.calledWith(testGame.pin, testGame.players[0])).to.equal(true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should not tell the host if host is not in the game', (done) => {
        gameServiceStub.getGame.resolves(undefined);
        stub(service['sio'].sockets.sockets, 'get').returns(undefined);
        clientSocket.emit('update-player', { pin: testGame.pin, data: testGame.players[0] });
        setTimeout(() => {
            expect(gameServiceStub.updatePlayer.called).to.equal(true);
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
            clientSocket.emit('update-scores', { pin: testGame.pin, data: questionIndex });
        });
    });

    it('should confirm player answer', (done) => {
        gameServiceStub.createGame.resolves(testGame);
        clientSocket.emit('create-game', testGame.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            gameServiceStub.updatePlayer.resolves();
            clientSocket.emit('confirm-player-answer', { pin: testGame.pin, data: testGame.players[0] });
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
            clientSocket.emit('answer', { pin: testGame.pin, data: answer });
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
