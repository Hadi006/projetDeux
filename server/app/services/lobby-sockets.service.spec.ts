import { Server } from '@app/server';
import { LobbySocketsService } from '@app/services/lobby-sockets.service';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore, spy, stub } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { LobbiesService } from './lobbies.service';
import { Quiz } from '@common/quiz';
import { LobbyData } from '@common/lobby-data';

describe('LobbySocketsService', () => {
    let service: LobbySocketsService;
    let lobbiesServiceStub: SinonStubbedInstance<LobbiesService>;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';

    const testQuiz: Quiz = {
        id: '1',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 5,
        lastModification: new Date(),
        questions: [],
    };

    const testLobby: LobbyData = {
        id: '1',
        players: [],
        started: false,
        quiz: { ...testQuiz },
    };

    beforeEach(async () => {
        lobbiesServiceStub = createStubInstance(LobbiesService);
        Container.set(LobbiesService, lobbiesServiceStub);
        server = Container.get(Server);
        server.init();
        service = server['lobbySocketsService'];
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
            expect(ack.quiz).to.deep.equal({ ...testQuiz, lastModification: testQuiz.lastModification.toISOString() });
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
        lobbiesServiceStub.getLobby.resolves(testLobby);
        clientSocket.emit('join-lobby', testLobby.id, (ack: string) => {
            expect(ack).to.equal('');
            expect(lobbiesServiceStub.getLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should not join a lobby', (done) => {
        lobbiesServiceStub.getLobby.resolves(undefined);
        clientSocket.emit('join-lobby', testLobby.id, (ack: string) => {
            expect(ack).to.equal('PIN invalide');
            expect(lobbiesServiceStub.getLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should delete a lobby', (done) => {
        lobbiesServiceStub.deleteLobby.resolves(true);
        clientSocket.emit('delete-lobby', testLobby.id, (ack: void) => {
            expect(ack).to.equal(undefined);
            expect(lobbiesServiceStub.deleteLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should broadcast a countdown if in the lobby', (done) => {
        const countdown = 5;
        lobbiesServiceStub.getLobby.resolves(testLobby);
        clientSocket.emit('join-lobby', testLobby.id, () => {
            clientSocket.on('start-countdown', (time: number) => {
                expect(time).to.equal(countdown);
                done();
            });
            clientSocket.emit('start-countdown', { lobbyId: testLobby.id, time: countdown });
        });
    });

    it('should broadcast a start game if in the lobby', (done) => {
        lobbiesServiceStub.getLobby.resolves(testLobby);
        const toSpy = spy(service['sio'], 'to');
        clientSocket.emit('join-lobby', testLobby.id, () => {
            clientSocket.on('start-game', () => {
                expect(toSpy.calledWith(testLobby.id)).to.equal(true);
                done();
            });
            clientSocket.emit('start-game', testLobby.id);
        });
    });
});
