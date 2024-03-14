import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { GOOD_ANSWER_BONUS, GAME_ID_LENGTH, GAME_ID_MAX, NEW_GAME, NEW_PLAYER } from '@common/constant';
import { Quiz } from '@common/quiz';
import { Player } from '@common/player';
import { Game } from '@common/game';

@Service()
export class GameService {
    constructor(private database: DatabaseService) {}

    async getGames(): Promise<Game[]> {
        return await this.database.get<Game>('games');
    }

    async getGame(gameId: string): Promise<Game> {
        return (await this.database.get<Game>('games', { id: gameId }))[0];
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
        return await this.database.update('games', { id: game.pin }, [{ $set: game }]);
    }

    async deleteGame(gameId: string): Promise<boolean> {
        return await this.database.delete('games', { id: gameId });
    }

    async checkGameAvailability(gameId: string): Promise<string> {
        const game = await this.getGame(gameId);
        if (!game || game.pin !== gameId) {
            return 'Le NIP est invalide';
        }
        if (game.locked) {
            return 'La partie est verouillée';
        }
        return '';
    }

    async addPlayer(gameId: string, playerName: string): Promise<{ player: Player; players: string[]; error: string }> {
        const game = await this.getGame(gameId);
        const player: Player = { ...NEW_PLAYER, name: playerName };
        const lowerCasePlayerName = playerName.toLocaleLowerCase();

        if (!game || game.pin !== gameId) {
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

    async updatePlayer(gameId: string, player: Player): Promise<void> {
        const game = await this.getGame(gameId);
        if (!game || game.pin !== gameId) {
            return;
        }

        game.players.forEach((p, index) => {
            if (p.name === player.name) {
                game.players[index] = player;
            }
        });

        await this.updateGame(game);
    }

    async updateScores(gameId: string, questionIndex: number): Promise<void> {
        const game = await this.getGame(gameId);
        if (!game || game.pin !== gameId) {
            return;
        }

        const question = game.quiz?.questions[questionIndex];
        if (!question) {
            return;
        }

        const sortedPlayers = game.players.sort((a, b) => {
            const dateA = new Date(a.questions[questionIndex].lastModification);
            const dateB = new Date(b.questions[questionIndex].lastModification);
            return dateA.getTime() - dateB.getTime();
        });

        const isOldestUnique = this.isOldestUnique(sortedPlayers, questionIndex);

        sortedPlayers.forEach((player, playerIndex) => {
            const playerAnswer = player.questions[questionIndex];
            const isCorrect = playerAnswer.choices.every((choice, choiceIndex) => choice.isCorrect === question.choices[choiceIndex].isCorrect);

            player.score += isCorrect ? question.points : 0;

            if (isCorrect && isOldestUnique && playerIndex === 0) {
                player.score += question.points * GOOD_ANSWER_BONUS;
                player.fastestResponseCount++;
            }
        });
        await this.updateGame(game);
    }

    private oldestModificationDate(sortedPlayers: Player[], questionIndex: number): Date {
        return sortedPlayers[0].questions[questionIndex].lastModification;
    }

    private isOldestUnique(sortedPlayers: Player[], questionIndex: number): boolean {
        if (sortedPlayers.length === 1) {
            return true;
        }

        return this.oldestModificationDate(sortedPlayers, questionIndex) !== sortedPlayers[1].questions[questionIndex].lastModification;
    }
}
