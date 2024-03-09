import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { LobbiesService } from './lobbies.service';
import { Quiz } from '@common/quiz';

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
        socket.on('create-lobby', async (quiz: Quiz, ack) => {
            ack(await this.lobbiesService.createLobby(quiz));
        });
    }

    private joinLobby(socket: Socket): void {
        socket.on('join-lobby', async (lobbyId: string, ack) => {
            if (await this.lobbiesService.getLobby(lobbyId)) {
                socket.join(lobbyId);
                ack('');
            }
            ack('PIN invalide');
        });
    }

    private deleteLobby(socket: Socket): void {
        socket.on('delete-lobby', async (lobbyId: string, ack) => {
            await this.lobbiesService.deleteLobby(lobbyId);
            ack();
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
