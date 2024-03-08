import { Server } from '@app/server';
import { LobbySocketsService } from '@app/services/lobby-sockets.service';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, restore, stub } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { LobbiesService } from './lobbies.service';
import { LobbyData } from '@common/lobby-data';

describe('LobbySocketsService', () => {
    let service: LobbySocketsService;
    let lobbiesServiceStub: SinonStubbedInstance<LobbiesService>;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    const testLobby: LobbyData = {
        id: '1',
        players: [],
        quiz: { id: '1', title: 'Math', visible: true, description: 'Math quiz', duration: 5, lastModification: new Date(), questions: [] },
        started: false,
    };

    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        service = server['lobbySocketsService'];
        lobbiesServiceStub = createStubInstance(LobbiesService);
        service['lobbiesService'] = lobbiesServiceStub;
        clientSocket = ioClient(urlString);
        stub(console, 'log');
    });

    afterEach(() => {
        clientSocket.close();
        service['io'].close();
        restore();
    });

    it('should create a lobby', (done) => {
        clientSocket.emit('create-lobby', testLobby, () => {
            expect(lobbiesServiceStub.addLobby.calledWith(testLobby)).to.equal(true);
            done();
        });
    });
});
