import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class LobbySocketsService {
    private io: SocketIOServer;

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }
}
