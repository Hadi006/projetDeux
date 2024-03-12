import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { LobbiesService } from './lobbies.service';
import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

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
            this.startGame(socket);
            this.addPlayer(socket);
            this.nextQuestion(socket);
            this.updatePlayer(socket);
            this.updateScores(socket);
            this.endQuestion(socket);
            this.confirmPlayerAnswer(socket);
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
        socket.on('join-game', async (lobbyId: string, callback) => {
            callback(await this.lobbiesService.checkLobbyAvailability(lobbyId));
        });
    }

    private deleteLobby(socket: Socket): void {
        socket.on('delete-lobby', async (lobbyId: string) => {
            await this.lobbiesService.deleteLobby(lobbyId);
        });
    }

    private startGame(socket: Socket): void {
        socket.on('start-game', ({ lobbyId, countdown }) => {
            this.sio.to(lobbyId).emit('start-game', countdown);
        });
    }

    private addPlayer(socket: Socket): void {
        socket.on('create-player', async ({ pin, playerName }, callback) => {
            const result: { player: Player; players: string[]; error: string } = await this.lobbiesService.addPlayer(pin, playerName);
            if (!result.error) {
                socket.join(pin);
                this.sio.to(pin).emit('player-joined', result.player.name);
            }
            callback(result);
        });
    }

    private nextQuestion(socket: Socket): void {
        socket.on('next-question', ({ lobbyId, question, countdown }) => {
            this.sio.to(lobbyId).emit('next-question', { question, countdown });
        });
    }

    private updatePlayer(socket: Socket): void {
        socket.on('update-player', async ({ lobbyId, player }) => {
            await this.lobbiesService.updatePlayer(lobbyId, player);
        });
    }
    private updateScores(socket: Socket): void {
        socket.on('update-scores', async ({ lobbyId, questionIndex }) => {
            await this.lobbiesService.updateScores(lobbyId, questionIndex);
            (await this.lobbiesService.getLobby(lobbyId)).players.forEach((player) => {
                this.sio.to(lobbyId).emit('new-score', player);
            });
        });
    }

    private confirmPlayerAnswer(socket: Socket): void {
        socket.on('confirm-player-answer', (lobbyId: string) => {
            this.sio.to(lobbyId).emit('confirm-player-answer');
        });
    }

    private endQuestion(socket: Socket): void {
        socket.on('end-question', (lobbyId: string) => {
            this.sio.to(lobbyId).emit('end-question');
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
