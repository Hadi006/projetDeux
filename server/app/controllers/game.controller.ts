import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameService } from '@app/services/game.service';
import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

export class GameController {
    private sio: SocketIOServer;

    constructor(
        private gameService: GameService,
        server: HTTPServer,
    ) {
        this.sio = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket: Socket) => {
            this.createGame(socket);
            this.joinGame(socket);
            this.deleteGame(socket);
            this.startGame(socket);
            this.addPlayer(socket);
            this.nextQuestion(socket);
            this.updatePlayer(socket);
            this.updateScores(socket);
            this.endQuestion(socket);
            this.confirmPlayerAnswer(socket);
            this.answer(socket);
            this.endGame(socket);
            this.disconnect(socket);
        });
    }

    private createGame(socket: Socket): void {
        socket.on('create-game', async (quiz: Quiz, ack) => {
            const game = await this.gameService.createGame(quiz);
            if (game) {
                socket.join(game.id);
                ack(game);
            }
            ack(game);
        });
    }

    private joinGame(socket: Socket): void {
        socket.on('join-game', async (game: string, callback) => {
            callback(await this.gameService.checkGameAvailability(game));
        });
    }

    private deleteGame(socket: Socket): void {
        socket.on('delete-game', async (game: string) => {
            await this.gameService.deleteGame(game);
        });
    }

    private startGame(socket: Socket): void {
        socket.on('start-game', ({ game, countdown }) => {
            this.sio.to(game).emit('start-game', countdown);
        });
    }

    private addPlayer(socket: Socket): void {
        socket.on('create-player', async ({ pin, playerName }, callback) => {
            const result: { player: Player; players: string[]; error: string } = await this.gameService.addPlayer(pin, playerName);
            if (!result.error) {
                socket.join(pin);
                this.sio.to(pin).emit('player-joined', result.player.name);
            }
            callback(result);
        });
    }

    private nextQuestion(socket: Socket): void {
        socket.on('next-question', ({ game, question, countdown }) => {
            this.sio.to(game).emit('next-question', { question, countdown });
        });
    }

    private updatePlayer(socket: Socket): void {
        socket.on('update-player', async ({ game, player }) => {
            await this.gameService.updatePlayer(game, player);
        });
    }
    private updateScores(socket: Socket): void {
        socket.on('update-scores', async ({ game, questionIndex }) => {
            await this.gameService.updateScores(game, questionIndex);
            (await this.gameService.getGame(game)).players.forEach((player) => {
                this.sio.to(game).emit('new-score', player);
            });
        });
    }

    private confirmPlayerAnswer(socket: Socket): void {
        socket.on('confirm-player-answer', async ({ game, player }) => {
            player.questions[player.questions.length - 1].lastModification = new Date();
            await this.gameService.updatePlayer(game, player);
            this.sio.to(game).emit('confirm-player-answer');
        });
    }

    private endQuestion(socket: Socket): void {
        socket.on('end-question', (game: string) => {
            this.sio.to(game).emit('end-question');
        });
    }

    private answer(socket: Socket): void {
        socket.on('answer', ({ game, answer }) => {
            this.sio.to(game).emit('answer', answer);
        });
    }

    private endGame(socket: Socket): void {
        socket.on('end-game', (game: string) => {
            this.sio.to(game).emit('end-game');
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
