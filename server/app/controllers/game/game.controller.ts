import { GameService } from '@app/services/game/game.service';
import { JoinGameResult } from '@common/join-game-result';
import { NextQuestionEventData } from '@common/next-question-event-data';
import { Player } from '@common/player';
import { Answer, Question, Quiz } from '@common/quiz';
import { RoomData } from '@common/room-data';
import { Server as HTTPServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';

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
            this.onKick(socket);
            this.onStartGame(socket);
            this.onNextQuestion(socket);
            this.onUpdatePlayer(socket);
            this.onUpdateScores(socket);
            this.onEndQuestion(socket);
            this.onConfirmPlayerAnswer(socket);
            this.onAnswer(socket);
            this.chatMessages(socket);
            this.onEndGame(socket);
            this.onDisconnect(socket);
            this.onPauseTimer(socket);
        });
    }

    private chatMessages(socket: Socket): void {
        socket.on('new-message', async (message) => {
            const roomPin = message.roomId;
            this.sio.to(roomPin).emit('message-received', message);
        });
    }
    private onCreateGame(socket: Socket): void {
        socket.on('create-game', async (quiz: Quiz, callback) => {
            const game = await this.gameService.createGame(quiz, socket.id);
            if (game) {
                socket.join(game.pin);
            }
            callback(game);
        });
    }

    private onToggleLock(socket: Socket): void {
        socket.on('toggle-lock', async (roomData: RoomData<boolean>) => {
            const game = await this.gameService.getGame(roomData.pin);
            game.locked = roomData.data;
            await this.gameService.updateGame(game);
        });
    }

    private onJoinGame(socket: Socket): void {
        socket.on('join-game', async (roomData: RoomData<string>, callback) => {
            const pin = roomData.pin;

            const result: JoinGameResult = await this.gameService.addPlayer(pin, roomData.data);

            if (!result.error) {
                socket.join(pin);
                this.sio.to(pin).emit('player-joined', result.player);
            }

            callback(result);
        });
    }

    private onPlayerLeave(socket: Socket): void {
        socket.on('player-leave', async (roomData: RoomData<string>) => {
            const pin = roomData.pin;
            const playerName = roomData.data;

            const game = await this.gameService.getGame(pin);

            if (!game) {
                return;
            }

            const player = game.players.find((p) => p.name === playerName);
            game.players = game.players.filter((p) => p.name !== playerName);
            await this.gameService.updateGame(game);
            this.sio.to(pin).emit('player-left', { players: game.players, player });
        });
    }

    private onDeleteGame(socket: Socket): void {
        socket.on('delete-game', async (pin: string) => {
            await this.gameService.deleteGame(pin);
            this.sio.to(pin).emit('game-deleted');
        });
    }

    private onKick(socket: Socket): void {
        socket.on('kick', async (roomData: RoomData<string>) => {
            const pin = roomData.pin;
            const playerName = roomData.data;

            const game = await this.gameService.getGame(pin);
            const player = game.players.find((p) => p.name === playerName);
            game.players = game.players.filter((p) => p.name !== playerName);
            game.bannedNames.push(playerName.toLocaleLowerCase());
            await this.gameService.updateGame(game);
            this.sio.to(pin).emit('kicked', playerName);
            this.sio.to(pin).emit('player-left', { players: game.players, player });
        });
    }

    private onStartGame(socket: Socket): void {
        socket.on('start-game', (roomData: RoomData<number>) => {
            this.sio.to(roomData.pin).emit('start-game', roomData.data);
        });
    }

    private onNextQuestion(socket: Socket): void {
        socket.on('next-question', async (roomData: RoomData<NextQuestionEventData>) => {
            const blankQuestion: Question = roomData.data.question;
            blankQuestion.choices.forEach((choice) => {
                choice.isCorrect = false;
            });
            const game = await this.gameService.getGame(roomData.pin);
            game.players.forEach((player) => {
                player.questions.push(blankQuestion);
            });
            game.histograms.push(roomData.data.histogram);
            await this.gameService.updateGame(game);

            this.sio.to(roomData.pin).emit('question-changed', { question: blankQuestion, countdown: roomData.data.countdown });
        });
    }

    private onUpdatePlayer(socket: Socket): void {
        socket.on('update-player', async (roomData: RoomData<Player>) => {
            const histogramData = await this.gameService.updatePlayer(roomData.pin, roomData.data);
            const hostId = (await this.gameService.getGame(roomData.pin))?.hostId;
            this.sio.sockets.sockets.get(hostId)?.emit('player-updated', histogramData);
        });
    }

    private onUpdateScores(socket: Socket): void {
        socket.on('update-scores', async (roomData: RoomData<number>, callback) => {
            const pin = roomData.pin;

            await this.gameService.updateScores(pin, roomData.data);
            const game = await this.gameService.getGame(pin);
            game.players.forEach((player) => {
                this.sio.to(pin).emit('new-score', player);
            });
            callback(game);
        });
    }

    private onConfirmPlayerAnswer(socket: Socket): void {
        socket.on('confirm-player-answer', async (roomData: RoomData<Player>) => {
            const pin = roomData.pin;
            const player = roomData.data;

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
        socket.on('answer', (roomData: RoomData<Answer[]>) => {
            this.sio.to(roomData.pin).emit('answer', roomData.data);
        });
    }

    private onEndGame(socket: Socket): void {
        socket.on('end-game', async (pin: string, callback) => {
            const game = await this.gameService.getGame(pin);
            this.sio.to(pin).emit('game-ended', game);
            callback(game);
        });
    }

    private onDisconnect(socket: Socket): void {
        socket.on('disconnect', () => {
            return;
        });
    }

    private onPauseTimer(socket: Socket): void {
        socket.on('pause-timer', (pin: string) => {
            this.sio.to(pin).emit('timer-paused');
        });
    }
}
