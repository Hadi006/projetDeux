import { Server } from '@app/server';
import { LobbySocketsService } from '@app/services/lobby-sockets.service';
import { assert, expect } from 'chai';
import { restore } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';

describe('LobbySocketsService', () => {
    let service: LobbySocketsService;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';

    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        service = server['lobbySocketsService'];
        clientSocket = ioClient(urlString);
    });

    afterEach(() => {
        clientSocket.close();
        service['io'].close();
        restore();
    });
});
