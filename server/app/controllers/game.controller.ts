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
                socket.join(game.pin);
                ack(game);
            }
            ack(game);
        });
    }

    private joinGame(socket: Socket): void {
        socket.on('join-game', async (pin: string, callback) => {
            callback(await this.gameService.checkGameAvailability(pin));
        });
    }

    private deleteGame(socket: Socket): void {
        socket.on('delete-game', async (pin: string) => {
            await this.gameService.deleteGame(pin);
        });
    }

    private startGame(socket: Socket): void {
        socket.on('start-game', ({ pin, countdown }) => {
            this.sio.to(pin).emit('start-game', countdown);
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
        socket.on('next-question', ({ pin, question, countdown }) => {
            this.sio.to(pin).emit('next-question', { question, countdown });
        });
    }

    private updatePlayer(socket: Socket): void {
        socket.on('update-player', async ({ pin, player }) => {
            await this.gameService.updatePlayer(pin, player);
        });
    }
    private updateScores(socket: Socket): void {
        socket.on('update-scores', async ({ pin, questionIndex }) => {
            await this.gameService.updateScores(pin, questionIndex);
            (await this.gameService.getGame(pin)).players.forEach((player) => {
                this.sio.to(pin).emit('new-score', player);
            });
        });
    }

    private confirmPlayerAnswer(socket: Socket): void {
        socket.on('confirm-player-answer', async ({ pin, player }) => {
            player.questions[player.questions.length - 1].lastModification = new Date();
            await this.gameService.updatePlayer(pin, player);
            this.sio.to(pin).emit('confirm-player-answer');
        });
    }

    private endQuestion(socket: Socket): void {
        socket.on('end-question', (pin: string) => {
            this.sio.to(pin).emit('end-question');
        });
    }

    private answer(socket: Socket): void {
        socket.on('answer', ({ pin, answer }) => {
            this.sio.to(pin).emit('answer', answer);
        });
    }

    private endGame(socket: Socket): void {
        socket.on('end-game', (pin: string) => {
            this.sio.to(pin).emit('end-game');
        });
    }

    private disconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
