import { GameService } from '@app/services/game/game.service';
import { ChatMessage } from '@common/chat-message';
import { JoinGameEventData } from '@common/join-game-event-data';
import { JoinGameResult } from '@common/join-game-result';
import { NextQuestionEventData } from '@common/next-question-event-data';
import { Player } from '@common/player';
import { Answer, Quiz } from '@common/quiz';
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
            this.onRequestGame(socket);
            this.onToggleLock(socket);
            this.onJoinGame(socket);
            this.onPlayerLeave(socket);
            this.onDeleteGame(socket);
            this.onKick(socket);
            this.onMute(socket);
            this.onStartGame(socket);
            this.onNextQuestion(socket);
            this.onUpdatePlayer(socket);
            this.onUpdatePlayers(socket);
            this.onUpdateScores(socket);
            this.onEndQuestion(socket);
            this.onConfirmPlayerAnswer(socket);
            this.onAnswer(socket);
            this.chatMessages(socket);
            this.onEndGame(socket);
            this.onDisconnecting(socket);
            this.onPauseTimer(socket);
            this.onPanicMode(socket);
        });
    }

    private chatMessages(socket: Socket): void {
        socket.on('new-message', async (data: RoomData<ChatMessage>) => {
            this.sio.to(data.pin).emit('message-received', data.data);
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

    private onRequestGame(socket: Socket): void {
        socket.on('request-game', async (pin: string, callback) => {
            const game = await this.gameService.getGame(pin);
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
        socket.on('join-game', async (roomData: RoomData<JoinGameEventData>, callback) => {
            const pin = roomData.pin;

            const result: JoinGameResult = await this.gameService.addPlayer(socket.id, pin, roomData.data);

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
            player.hasLeft = true;
            game.players = game.players.filter((p) => p.name !== playerName);
            await this.gameService.updateGame(game);
            this.sio.to(pin).emit('player-left', { players: game.players, player });
            this.sio.to(pin).emit('message-received', {
                text: `${playerName} a quitté la partie`,
                timestamp: new Date(),
                author: 'Système',
            });
        });
    }

    private onDeleteGame(socket: Socket): void {
        socket.on('delete-game', async (pin: string) => {
            const game = await this.gameService.getGame(pin);
            if (game && !game.ended) {
                await this.gameService.deleteGame(pin);
            }
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

    private onMute(socket: Socket): void {
        socket.on('mute', async (roomData: RoomData<Player>) => {
            const pin = roomData.pin;
            const player = roomData.data;

            const game = await this.gameService.getGame(pin);
            game.players.find((p) => p.id === player.id).muted = player.muted;
            await this.gameService.updateGame(game);

            this.sio.to(player.id).emit('player-muted', {
                text: player.muted ? 'Vous avez été muté' : 'Vous avez été démuté',
                timestamp: new Date(),
                author: 'Système',
            });
        });
    }

    private onStartGame(socket: Socket): void {
        socket.on('start-game', async (roomData: RoomData<number>) => {
            if (!(await this.isHost(socket, roomData.pin))) {
                return;
            }

            const game = await this.gameService.getGame(roomData.pin);
            game.nPlayers = game.players.length;
            await this.gameService.updateGame(game);
            this.sio.to(roomData.pin).emit('start-game', roomData.data);
        });
    }

    private onNextQuestion(socket: Socket): void {
        socket.on('next-question', async (roomData: RoomData<NextQuestionEventData>) => {
            if (!(await this.isHost(socket, roomData.pin))) {
                return;
            }

            this.sio.to(roomData.pin).emit('question-changed', await this.gameService.createNextQuestion(roomData));
        });
    }

    private onUpdatePlayer(socket: Socket): void {
        socket.on('update-player', async (roomData: RoomData<Player>) => {
            const histogramData = await this.gameService.updatePlayer(roomData.pin, roomData.data);
            const hostId = (await this.gameService.getGame(roomData.pin))?.hostId;
            this.sio.to(hostId).emit('player-updated', { player: roomData.data, histogramData });
        });
    }

    private onUpdatePlayers(socket: Socket): void {
        socket.on('update-players', async (roomData: RoomData<Player[]>) => {
            (await this.gameService.updatePlayers(roomData)).forEach((player) => {
                this.sio.to(roomData.pin).emit('new-score', player);
            });
        });
    }

    private onUpdateScores(socket: Socket): void {
        socket.on('update-scores', async (roomData: RoomData<number>, callback) => {
            if (!(await this.isHost(socket, roomData.pin))) {
                return;
            }

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
            const histogramData = await this.gameService.updatePlayer(pin, player);
            this.sio.to(pin).emit('player-updated', { player, histogramData });
            this.sio.to(pin).emit('confirm-player-answer');
        });
    }

    private onEndQuestion(socket: Socket): void {
        socket.on('end-question', async (pin: string) => {
            if (!(await this.isHost(socket, pin))) {
                return;
            }

            this.sio.to(pin).emit('end-question');
        });
    }

    private onAnswer(socket: Socket): void {
        socket.on('answer', async (roomData: RoomData<Answer[]>) => {
            if (!(await this.isHost(socket, roomData.pin))) {
                return;
            }

            this.sio.to(roomData.pin).emit('answer', roomData.data);
        });
    }

    private onEndGame(socket: Socket): void {
        socket.on('end-game', async (pin: string, callback) => {
            if (!(await this.isHost(socket, pin))) {
                return;
            }

            const game = await this.gameService.getGame(pin);
            game.ended = true;
            game.bestScore = Math.max(...game.players.map((p) => p.score));
            await this.gameService.updateGame(game);
            this.sio.to(pin).emit('game-ended', game);
            callback(game);
        });
    }

    private onDisconnecting(socket: Socket): void {
        socket.on('disconnecting', async () => {
            socket.rooms.forEach(async (room) => {
                const game = await this.gameService.getGame(room);
                if (!game) {
                    return;
                }

                const player = game.players.find((p) => p.id === socket.id);
                game.players = game.players.filter((p) => p.id !== socket.id);

                if (game.hostId === socket.id) {
                    if (game.quiz.id === '-1' && game.players.length >= 1) {
                        game.hostId = game.players[0].id;
                        this.sio.to(game.hostId).emit('new-host', game);
                    } else {
                        if (!game.ended) {
                            await this.gameService.deleteGame(room);
                        }

                        this.sio.to(room).emit('game-deleted');
                        return;
                    }
                }

                await this.gameService.updateGame(game);
                this.sio.to(room).emit('player-left', { players: game.players, player });
            });
        });
    }
    private onPauseTimer(socket: Socket): void {
        socket.on('pause-timer', (pin: string) => {
            this.sio.to(pin).emit('timer-paused');
        });
    }

    private onPanicMode(socket: Socket): void {
        socket.on('panic-mode', (pin: string) => {
            this.sio.to(pin).emit('in-panic');
        });
    }

    private async isHost(socket: Socket, pin: string): Promise<boolean> {
        return (await this.gameService.getGame(pin))?.hostId === socket.id;
    }
}
