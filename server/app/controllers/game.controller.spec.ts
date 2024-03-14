import { Server } from '@app/server';
import { GameController } from '@app/controllers/game.controller';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore, spy, stub } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { LobbiesService } from '@app/services/lobbies.service';
import { Question, Quiz } from '@common/quiz';
import { LobbyData } from '@common/lobby-data';
import { NEW_PLAYER, TEST_LOBBY_DATA, TEST_QUESTIONS, TEST_QUIZZES } from '@common/constant';

describe('GameController', () => {
    let service: GameController;
    let lobbiesServiceStub: SinonStubbedInstance<LobbiesService>;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';

    let testQuestion: Question;
    let testQuiz: Quiz;
    let testLobby: LobbyData;

    const RESPONSE_DELAY = 200;

    beforeEach(async () => {
        testQuestion = JSON.parse(JSON.stringify(TEST_QUESTIONS[0]));
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        testLobby = JSON.parse(JSON.stringify(TEST_LOBBY_DATA));

        lobbiesServiceStub = createStubInstance(LobbiesService);
        Container.set(LobbiesService, lobbiesServiceStub);
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

    it('should create a lobby', (done) => {
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testQuiz, (ack: LobbyData | null) => {
            expect(ack.quiz).to.deep.equal(JSON.parse(JSON.stringify(testQuiz)));
            expect(lobbiesServiceStub.createLobby.called).to.equal(true);
            done();
        });
    });

    it('should not create a lobby', (done) => {
        lobbiesServiceStub.createLobby.resolves(null);
        clientSocket.emit('create-lobby', testQuiz, (ack: LobbyData | null) => {
            expect(ack).to.equal(null);
            expect(lobbiesServiceStub.createLobby.called).to.equal(true);
            done();
        });
    });

    it('should join a lobby', (done) => {
        lobbiesServiceStub.checkLobbyAvailability.resolves('');
        clientSocket.emit('join-game', testLobby.id, (ack: string) => {
            expect(ack).to.equal('');
            expect(lobbiesServiceStub.checkLobbyAvailability.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should not join a lobby', (done) => {
        lobbiesServiceStub.checkLobbyAvailability.resolves('Error');
        clientSocket.emit('join-game', testLobby.id, (ack: string) => {
            expect(ack).to.equal('Error');
            expect(lobbiesServiceStub.checkLobbyAvailability.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should delete a lobby', (done) => {
        lobbiesServiceStub.deleteLobby.resolves(true);
        clientSocket.emit('delete-lobby', testLobby.id);

        setTimeout(() => {
            expect(lobbiesServiceStub.deleteLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should broadcast a start game if in the lobby', (done) => {
        const countdown = 5;
        lobbiesServiceStub.createLobby.resolves(testLobby);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            clientSocket.on('start-game', (response) => {
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                expect(response).to.equal(countdown);
                done();
            });
            clientSocket.emit('start-game', { lobbyId: testLobby.id, countdown });
        });
    });

    it('should add a player to the lobby', (done) => {
        const playerName = 'John Doe';
        const result = {
            player: { ...NEW_PLAYER, name: playerName },
            players: [playerName],
            error: '',
        };
        lobbiesServiceStub.addPlayer.resolves(result);
        clientSocket.emit('create-player', { pin: testLobby.id, playerName }, (ack: typeof result) => {
            expect(ack).to.deep.equal(result);
            expect(lobbiesServiceStub.addPlayer.calledWith(testLobby.id, playerName)).to.equal(true);
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
        lobbiesServiceStub.addPlayer.resolves(result);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-player', { pin: testLobby.id, playerName }, (ack: typeof result) => {
            expect(ack).to.deep.equal(result);
            expect(lobbiesServiceStub.addPlayer.calledWith(testLobby.id, playerName)).to.equal(true);
            expect(toSpy.called).to.equal(false);
            done();
        });
    });

    it('should broadcast a next question', (done) => {
        const question = JSON.parse(JSON.stringify(testQuestion));
        const countdown = 5;
        lobbiesServiceStub.createLobby.resolves(testLobby);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            clientSocket.on('next-question', (response) => {
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                expect(response).to.deep.equal({ question, countdown });
                done();
            });
            clientSocket.emit('next-question', { lobbyId: testLobby.id, question, countdown });
        });
    });

    it('should update player', (done) => {
        clientSocket.emit('update-player', { lobbyId: testLobby.id, player: testLobby.players[0] });
        setTimeout(() => {
            expect(lobbiesServiceStub.updatePlayer.calledWith(testLobby.id, testLobby.players[0])).to.equal(true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should update scores', (done) => {
        const questionIndex = 0;
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            lobbiesServiceStub.updateScores.resolves();
            lobbiesServiceStub.getLobby.resolves(testLobby);
            let count = 0;
            clientSocket.on('new-score', (response) => {
                if (response.name === testLobby.players[0].name) {
                    expect(response).to.deep.equal(testLobby.players[0]);
                }

                if (response.name === testLobby.players[1].name) {
                    expect(response).to.deep.equal(testLobby.players[1]);
                }

                if (++count === testLobby.players.length) {
                    done();
                }
            });
            clientSocket.emit('update-scores', { lobbyId: testLobby.id, questionIndex });
        });
    });

    it('should confirm player answer', (done) => {
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            lobbiesServiceStub.updatePlayer.resolves();
            clientSocket.emit('confirm-player-answer', { lobbyId: testLobby.id, player: testLobby.players[0] });
            setTimeout(() => {
                expect(lobbiesServiceStub.updatePlayer.called).to.equal(true);
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should end question', (done) => {
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            clientSocket.emit('end-question', testLobby.id);
            setTimeout(() => {
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should answer', (done) => {
        const playerName = 'John Doe';
        const answer = { playerName, choices: [true, false, false, false] };
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            clientSocket.emit('answer', { lobbyId: testLobby.id, answer });
            setTimeout(() => {
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should end game', (done) => {
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testLobby.quiz, () => {
            const toSpy = spy(service['sio'], 'to');
            clientSocket.emit('end-game', testLobby.id);
            setTimeout(() => {
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                done();
            }, RESPONSE_DELAY);
        });
    });
});
