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
            this.onCreateGame(socket);
            this.onToggleLock(socket);
            this.onJoinGame(socket);
            this.onPlayerLeave(socket);
            this.onDeleteGame(socket);
            this.onStartGame(socket);
            this.onNextQuestion(socket);
            this.onUpdatePlayer(socket);
            this.onUpdateScores(socket);
            this.onEndQuestion(socket);
            this.onConfirmPlayerAnswer(socket);
            this.onAnswer(socket);
            this.onEndGame(socket);
            this.onDisconnect(socket);
        });
    }

    private onCreateGame(socket: Socket): void {
        socket.on('create-game', async (quiz: Quiz, callback) => {
            const game = await this.gameService.createGame(quiz);
            if (game) {
                socket.join(game.pin);
            }
            callback(game);
        });
    }

    private onToggleLock(socket: Socket): void {
        socket.on('toggle-lock', async ({ pin, lockState }) => {
            const game = await this.gameService.getGame(pin);
            game.locked = lockState;
            await this.gameService.updateGame(game);
        });
    }

    private onJoinGame(socket: Socket): void {
        socket.on('join-game', async ({ pin, playerName }, callback) => {
            const result: { player: Player; players: string[]; gameTitle: string; error: string } = await this.gameService.addPlayer(pin, playerName);

            if (!result.error) {
                socket.join(pin);
                this.sio.to(pin).emit('player-joined', result.player);
            }

            callback(result);
        });
    }

    private onPlayerLeave(socket: Socket): void {
        socket.on('player-leave', async ({ pin, playerName }) => {
            const game = await this.gameService.getGame(pin);

            if (!game) {
                return;
            }

            game.players = game.players.filter((player) => player.name !== playerName);
            await this.gameService.updateGame(game);
            this.sio.to(pin).emit('player-left', game.players);
        });
    }

    private onDeleteGame(socket: Socket): void {
        socket.on('delete-game', async (pin: string) => {
            await this.gameService.deleteGame(pin);
        });
    }

    private onStartGame(socket: Socket): void {
        socket.on('start-game', ({ pin, countdown }) => {
            this.sio.to(pin).emit('start-game', countdown);
        });
    }

    private onNextQuestion(socket: Socket): void {
        socket.on('next-question', ({ pin, question, countdown }) => {
            this.sio.to(pin).emit('next-question', { question, countdown });
        });
    }

    private onUpdatePlayer(socket: Socket): void {
        socket.on('update-player', async ({ pin, player }) => {
            await this.gameService.updatePlayer(pin, player);
        });
    }
    private onUpdateScores(socket: Socket): void {
        socket.on('update-scores', async ({ pin, questionIndex }) => {
            await this.gameService.updateScores(pin, questionIndex);
            (await this.gameService.getGame(pin)).players.forEach((player) => {
                this.sio.to(pin).emit('new-score', player);
            });
        });
    }

    private onConfirmPlayerAnswer(socket: Socket): void {
        socket.on('confirm-player-answer', async ({ pin, player }) => {
            player.questions[player.questions.length - 1].lastModification = new Date();
            await this.gameService.updatePlayer(pin, player);
            this.sio.to(pin).emit('confirm-player-answer');
        });
    }

    private onEndQuestion(socket: Socket): void {
        socket.on('end-question', (pin: string) => {
            this.sio.to(pin).emit('end-question');
        });
    }

    private onAnswer(socket: Socket): void {
        socket.on('answer', ({ pin, answer }) => {
            this.sio.to(pin).emit('answer', answer);
        });
    }

    private onEndGame(socket: Socket): void {
        socket.on('end-game', (pin: string) => {
            this.sio.to(pin).emit('end-game');
        });
    }

    private onDisconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }
}
