import { Server } from '@app/server';
import { LobbySocketsService } from '@app/services/lobby-sockets.service';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore, stub } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { LobbiesService } from './lobbies.service';
import { LobbyData } from '@common/lobby-data';
import { Acknowledgment } from '@common/acknowledgment';

describe('LobbySocketsService', () => {
    let service: LobbySocketsService;
    let lobbiesServiceStub: SinonStubbedInstance<LobbiesService>;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    const testLobby: LobbyData = {
        id: '1',
        players: [],
        started: false,
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
        lobbiesServiceStub.addLobby.resolves(true);
        clientSocket.emit('create-lobby', testLobby, (ack: Acknowledgment) => {
            expect(ack.success).to.equal(true);
            expect(lobbiesServiceStub.addLobby.calledWith(testLobby)).to.equal(true);
            done();
        });
    });

    it('should not create a lobby', (done) => {
        lobbiesServiceStub.addLobby.resolves(false);
        clientSocket.emit('create-lobby', testLobby, (ack: Acknowledgment) => {
            expect(ack.success).to.equal(false);
            expect(lobbiesServiceStub.addLobby.calledWith(testLobby)).to.equal(true);
            done();
        });
    });

    it('should join a lobby', (done) => {
        lobbiesServiceStub.getLobby.resolves(testLobby);
        clientSocket.emit('join-lobby', testLobby.id, (ack: Acknowledgment) => {
            expect(ack.success).to.equal(true);
            expect(lobbiesServiceStub.getLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should not join a lobby', (done) => {
        lobbiesServiceStub.getLobby.resolves(undefined);
        clientSocket.emit('join-lobby', testLobby.id, (ack: Acknowledgment) => {
            expect(ack.success).to.equal(false);
            expect(lobbiesServiceStub.getLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });

    it('should delete a lobby', (done) => {
        lobbiesServiceStub.deleteLobby.resolves(true);
        clientSocket.emit('delete-lobby', testLobby.id, (ack: Acknowledgment) => {
            expect(ack.success).to.equal(true);
            expect(lobbiesServiceStub.deleteLobby.calledWith(testLobby.id)).to.equal(true);
            done();
        });
    });
});
