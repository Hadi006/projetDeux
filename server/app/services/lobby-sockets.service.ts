import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { LobbyData } from '@common/lobby-data';
import { LobbiesService } from './lobbies.service';
import { Inject } from 'typedi';

export class LobbySocketsService {
    private sio: SocketIOServer;

    constructor(
        @Inject(() => LobbiesService) private lobbiesService: LobbiesService,
        server: HTTPServer,
    ) {
        this.sio = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket: Socket) => {
            this.createLobby(socket);
            this.joinLobby(socket);
            this.disconnect(socket);
        });
    }

    private createLobby(socket: Socket): void {
        socket.on('create-lobby', async (lobby: LobbyData, ack) => {
            const result = await this.lobbiesService.addLobby(lobby);
            ack({ success: result });
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

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
