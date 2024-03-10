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
            this.startCountdown(socket);
            this.disconnect(socket);
        });
    }

    private createLobby(socket: Socket): void {
        socket.on('create-lobby', async (quiz: Quiz, ack) => {
            const lobby = await this.lobbiesService.createLobby(quiz);
            if (lobby) {
                socket.join(lobby.id);
                ack(lobby);
            }
            ack(lobby);
        });
    }

    private joinLobby(socket: Socket): void {
        socket.on('join-lobby', async (lobbyId: string, ack) => {
            if (await this.lobbiesService.getLobby(lobbyId)) {
                socket.join(lobbyId);
                ack('');
            } else {
                ack('PIN invalide');
            }
        });
    }

    private deleteLobby(socket: Socket): void {
        socket.on('delete-lobby', async (lobbyId: string, ack) => {
            await this.lobbiesService.deleteLobby(lobbyId);
            ack();
        });
    }

    private startCountdown(socket: Socket): void {
        socket.on('start-countdown', ({ lobbyId, time }) => {
            this.sio.to(lobbyId).emit('start-countdown', time);
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
