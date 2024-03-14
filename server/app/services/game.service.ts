import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { ANSWER_TIME_BUFFER, GOOD_ANSWER_BONUS, GAME_ID_LENGTH, GAME_ID_MAX, NEW_GAME, NEW_PLAYER } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { Player } from '@common/player';
import { Game } from '@common/game';

@Service()
export class GameService {
    constructor(private database: DatabaseService) {}

    async getGames(): Promise<Game[]> {
        return await this.database.get<Game>('games');
    }

    async getGame(pin: string): Promise<Game> {
        return (await this.database.get<Game>('games', { pin }))[0];
    }

    async createGame(quiz: Quiz): Promise<Game | undefined> {
        let pin: string;

        const games = await this.getGames();

        if (games.length >= GAME_ID_MAX) {
            return undefined;
        }

        do {
            pin = Math.floor(Math.random() * GAME_ID_MAX)
                .toString()
                .padStart(GAME_ID_LENGTH, '0');
        } while (games.some((game) => game.pin === pin));

        const newGame: Game = { ...NEW_GAME, pin, quiz };
        await this.database.add('games', newGame);
        return newGame;
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

    async addPlayer(pin: string, playerName: string): Promise<{ player: Player; players: string[]; error: string }> {
        const game = await this.getGame(pin);
        const player: Player = { ...NEW_PLAYER, name: playerName };
        const lowerCasePlayerName = playerName.toLocaleLowerCase();

        if (!game || game.pin !== pin) {
            return { player, players: [], error: 'Le NIP est invalide' };
        }

        if (game.locked) {
            return { player, players: [], error: 'La partie est verrouillée' };
        }

        if (game.players.some((p) => p.name.toLocaleLowerCase() === lowerCasePlayerName)) {
            return { player, players: [], error: 'Ce nom est déjà utilisé' };
        }

        if (lowerCasePlayerName === 'organisateur') {
            return { player, players: [], error: 'Pseudo interdit' };
        }

        if (lowerCasePlayerName.trim() === '') {
            return { player, players: [], error: "Pseudo vide n'est pas permis" };
        }

        game.players.push(player);
        await this.updateGame(game);

        return { player, players: game.players.map((p) => p.name), error: '' };
    }

    async updatePlayer(pin: string, player: Player): Promise<void> {
        const game = await this.getGame(pin);
        if (!game || game.pin !== pin) {
            return;
        }

        game.players.forEach((p, index) => {
            if (p.name === player.name) {
                game.players[index] = player;
            }
        });

        await this.updateGame(game);
    }

    async updateScores(pin: string, questionIndex: number): Promise<void> {
        const game = await this.getGame(pin);
        if (!game || game.pin !== pin) {
            return;
        }

        const question = game.quiz?.questions[questionIndex];
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
