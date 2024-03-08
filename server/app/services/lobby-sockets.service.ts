import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { LobbyData } from '@common/lobby-data';
import { LobbiesService } from './lobbies.service';

export class LobbySocketsService {
    private io: SocketIOServer;

    constructor(
        private lobbiesService: LobbiesService,
        server: HTTPServer,
    ) {
        this.io = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        this.io.on('connection', (socket: Socket) => {
            this.createLobby(socket);
            this.disconnect(socket);
        });
    }

    private createLobby(socket: Socket): void {
        socket.on('create-lobby', (lobby: LobbyData) => {
            this.lobbiesService.addLobby(lobby);
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
