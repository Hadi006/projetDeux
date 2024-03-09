import { Server } from '@app/server';
import { LobbySocketsService } from '@app/services/lobby-sockets.service';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore /* , stub */ } from 'sinon';
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
        // stub(console, 'log');
    });

    afterEach(() => {
        clientSocket.close();
        service['sio'].close();
        restore();
    });

    it('should create a lobby', (done) => {
        lobbiesServiceStub.createLobby.resolves(testLobby);
        clientSocket.emit('create-lobby', testQuiz, (ack: LobbyData) => {
            expect(ack.quiz).to.deep.equal({ ...testQuiz, lastModification: testQuiz.lastModification.toISOString() });
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
        clientSocket.emit('delete-lobby', testLobby.id, (ack: boolean) => {
            expect(ack).to.equal(true);
            expect(lobbiesServiceStub.deleteLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should not delete a lobby', (done) => {
        lobbiesServiceStub.deleteLobby.resolves(false);
        clientSocket.emit('delete-lobby', testLobby.id, (ack: boolean) => {
            expect(ack).to.equal(false);
            expect(lobbiesServiceStub.deleteLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });
});
