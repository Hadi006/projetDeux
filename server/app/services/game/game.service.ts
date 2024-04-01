import { DatabaseService } from '@app/services/database/database.service';
import { ANSWER_TIME_BUFFER, GAME_ID_LENGTH, GAME_ID_MAX, GOOD_ANSWER_BONUS, NEW_HISTOGRAM_DATA } from '@common/constant';
import { Game } from '@common/game';
import { HistogramData } from '@common/histogram-data';
import { JoinGameResult } from '@common/join-game-result';
import { Player } from '@common/player';
import { Question, Quiz } from '@common/quiz';
import { Service } from 'typedi';
import { JoinGameEventData } from '@common/join-game-event-data';

@Service()
export class GameService {
    constructor(private database: DatabaseService) {}

    async getGames(): Promise<Game[]> {
        return await this.database.get<Game>('games');
    }

    async getGame(pin: string): Promise<Game> {
        return (await this.database.get<Game>('games', { pin }))[0];
    }

    async createGame(quiz: Quiz, hostId: string): Promise<Game | void> {
        const games = await this.getGames();
        if (games.length >= GAME_ID_MAX) {
            return;
        }
        return await this.database.add('games', new Game(this.generatePin(games), hostId, quiz));
    }

    async updateGame(game: Game): Promise<boolean> {
        return await this.database.update('games', { pin: game.pin }, [{ $set: game }]);
    }

    async deleteGame(pin: string): Promise<boolean> {
        return await this.database.delete('games', { pin });
    }

    async checkGameAvailability(pin: string): Promise<string> {
        const game = await this.getGame(pin);
        if (!game || game.pin !== pin) {
            return 'Le NIP est invalide';
        }
        if (game.locked) {
            return 'La partie est verouillée';
        }
        return '';
    }

    async addPlayer(id: string, pin: string, joinGameData: JoinGameEventData): Promise<JoinGameResult> {
        const game = await this.getGame(pin);
        const name: string = joinGameData.playerName;
        const player: Player = new Player(id, name);
        const error = this.validatePin(pin, game) || this.validatePlayerName(name, game, joinGameData.isHost);
        if (error) {
            return new JoinGameResult(error, player);
        }

        game.players.push(player);
        await this.updateGame(game);

        return new JoinGameResult(error, player, game);
    }

    async updatePlayer(pin: string, player: Player): Promise<HistogramData> {
        const game = await this.getGame(pin);
        if (!game || game.pin !== pin) {
            return { ...NEW_HISTOGRAM_DATA };
        }

        const selectionChanges: number[] = [];
        let previousSelections: boolean[] = [];
        let currentSelections: boolean[] = [];

        game.players.forEach((p, index) => {
            if (p.name === player.name) {
                previousSelections = p.questions[p.questions.length - 1].choices.map((choice) => choice.isCorrect);
                currentSelections = player.questions[player.questions.length - 1].choices.map((choice) => choice.isCorrect);

                game.players[index] = player;
            }
        });

        currentSelections.forEach((currentSelection, index) => {
            selectionChanges.push(+currentSelection - +previousSelections[index]);
            game.histograms[game.histograms.length - 1].datasets[0].data[index] += +currentSelection - +previousSelections[index];
        });

        await this.updateGame(game);

        return game.histograms[game.histograms.length - 1];
    }

    async updateScores(pin: string, questionIndex: number): Promise<void> {
        const game = await this.getGame(pin);
        if (!game || game.pin !== pin) {
            return;
        }

        const question = game.quiz.questions[questionIndex];
        if (!question) {
            return;
        }

        const { firstCorrectPlayer, isUnique } = this.findFirstCorrectAndUniquePlayer(game.players, questionIndex, question);

        game.players.forEach((player) => {
            const isCorrect = this.isAnswerCorrect(player, questionIndex, question);
            if (isCorrect) {
                player.score += question.points;
            }
        });

        if (firstCorrectPlayer && isUnique) {
            firstCorrectPlayer.score += question.points * GOOD_ANSWER_BONUS;
            firstCorrectPlayer.fastestResponseCount++;
        }

        await this.updateGame(game);
    }

    private generatePin(games: Game[]) {
        let pin = '';
        do {
            pin = Math.floor(Math.random() * GAME_ID_MAX)
                .toString()
                .padStart(GAME_ID_LENGTH, '0');
        } while (games.some((game) => game.pin === pin));

        return pin;
    }

    private validatePin(pin: string, game: Game) {
        if (!game || game.pin !== pin) {
            return 'Le NIP est invalide';
        }
        if (game.locked) {
            return 'La partie est verrouillée';
        }
        return '';
    }

    private validatePlayerName(playerName: string, game: Game, isHost: boolean) {
        const lowerCasePlayerName = playerName.toLocaleLowerCase();
        if (game.players.some((p) => p.name.toLocaleLowerCase() === lowerCasePlayerName)) {
            return 'Ce nom est déjà utilisé';
        }
        if (lowerCasePlayerName.trim() === 'organisateur' && !isHost) {
            return 'Pseudo interdit';
        }
        if (lowerCasePlayerName.trim() === '') {
            return "Pseudo vide n'est pas permis";
        }
        if (game.bannedNames.includes(lowerCasePlayerName)) {
            return 'Ce nom est banni';
        }
        return '';
    }

    private findFirstCorrectAndUniquePlayer(
        players: Player[],
        questionIndex: number,
        question: Question,
    ): { firstCorrectPlayer: Player | null; isUnique: boolean } {
        let firstCorrectPlayer: Player | null = null;
        let isUnique = true;

        for (const player of players) {
            if (this.isAnswerCorrect(player, questionIndex, question)) {
                if (!firstCorrectPlayer) {
                    firstCorrectPlayer = player;
                } else {
                    const date = new Date();

                    if (!player.questions[questionIndex].lastModification) {
                        player.questions[questionIndex].lastModification = date;
                    }

                    if (!firstCorrectPlayer.questions[questionIndex].lastModification) {
                        firstCorrectPlayer.questions[questionIndex].lastModification = date;
                    }

                    const firstPlayerTime = new Date(firstCorrectPlayer.questions[questionIndex].lastModification).getTime();
                    const currentPlayerTime = new Date(player.questions[questionIndex].lastModification).getTime();
                    if (Math.abs(currentPlayerTime - firstPlayerTime) < ANSWER_TIME_BUFFER) {
                        isUnique = false;
                    } else if (currentPlayerTime < firstPlayerTime) {
                        firstCorrectPlayer = player;
                        isUnique = true;
                    }
                }
            }
        }

        return { firstCorrectPlayer, isUnique };
    }

    private isAnswerCorrect(player: Player, questionIndex: number, question: Question): boolean {
        return player.questions[questionIndex].choices.every((choice, choiceIndex) => choice.isCorrect === question.choices[choiceIndex].isCorrect);
    }
}
