import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { LobbyData } from '@common/lobby-data';
import { LobbiesService } from './lobbies.service';

export class LobbySocketsService {
    private sio: SocketIOServer;

    constructor(
        private lobbiesService: LobbiesService,
        server: HTTPServer,
    ) {
        this.sio = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket: Socket) => {
            this.createLobby(socket);
            this.joinLobby(socket);
            this.deleteLobby(socket);
            this.disconnect(socket);
        });
    }

    private createLobby(socket: Socket): void {
        socket.on('create-lobby', async (lobby: LobbyData, ack) => {
            ack({ success: await this.lobbiesService.addLobby(lobby) });
        });
    }

    private joinLobby(socket: Socket): void {
        socket.on('join-lobby', async (lobbyId: string, ack) => {
            if (await this.lobbiesService.getLobby(lobbyId)) {
                socket.join(lobbyId);
                ack({ success: true });
            }
            ack({ success: false });
        });
    }

    private deleteLobby(socket: Socket): void {
        socket.on('delete-lobby', async (lobbyId: string, ack) => {
            ack({ success: await this.lobbiesService.deleteLobby(lobbyId) });
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
