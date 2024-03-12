import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { LobbyData } from '@common/lobby-data';
import { LOBBY_ID_LENGTH, LOBBY_ID_MAX, NEW_LOBBY, NEW_PLAYER } from '@common/constant';
import { Quiz } from '@common/quiz';
import { Player } from '@common/player';

@Service()
export class LobbiesService {
    constructor(private database: DatabaseService) {}

    async getLobbies(): Promise<LobbyData[]> {
        return await this.database.get<LobbyData>('lobbies');
    }

    async getLobby(lobbyId: string): Promise<LobbyData> {
        return (await this.database.get<LobbyData>('lobbies', { id: lobbyId }))[0];
    }

    async createLobby(quiz: Quiz): Promise<LobbyData | undefined> {
        let id: string;

        const lobbies = await this.getLobbies();

        if (lobbies.length >= LOBBY_ID_MAX) {
            return undefined;
        }

        do {
            id = Math.floor(Math.random() * LOBBY_ID_MAX)
                .toString()
                .padStart(LOBBY_ID_LENGTH, '0');
        } while (lobbies.some((lobby) => lobby.id === id));

        const newLobby: LobbyData = { ...NEW_LOBBY, id, quiz };
        await this.database.add('lobbies', newLobby);
        return newLobby;
    }

    async updateLobby(lobby: LobbyData): Promise<boolean> {
        return await this.database.update('lobbies', { id: lobby.id }, [{ $set: lobby }]);
    }

    async deleteLobby(lobbyId: string): Promise<boolean> {
        return await this.database.delete('lobbies', { id: lobbyId });
    }

    async checkLobbyAvailability(lobbyId: string): Promise<string> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby || lobby.id !== lobbyId) {
            return 'Le NIP est invalide';
        }
        if (lobby.locked) {
            return 'La partie est verouillée';
        }
        return '';
    }

    async addPlayer(lobbyId: string, playerName: string): Promise<{ player: Player; players: string[]; error: string }> {
        const lobby = await this.getLobby(lobbyId);
        const player: Player = { ...NEW_PLAYER, name: playerName };
        const lowerCasePlayerName = playerName.toLocaleLowerCase();

        if (!lobby || lobby.id !== lobbyId) {
            return { player, players: [], error: 'Le NIP est invalide' };
        }

        if (lobby.locked) {
            return { player, players: [], error: 'La partie est verrouillée' };
        }

        if (lobby.players.some((lobbyPlayer) => lobbyPlayer.name.toLocaleLowerCase() === lowerCasePlayerName)) {
            return { player, players: [], error: 'Ce nom est déjà utilisé' };
        }

        if (lowerCasePlayerName === 'organisateur') {
            return { player, players: [], error: 'Pseudo interdit' };
        }

        if (lowerCasePlayerName.trim() === '') {
            return { player, players: [], error: "Pseudo vide n'est pas permis" };
        }

        lobby.players.push(player);
        await this.updateLobby(lobby);

        return { player, players: lobby.players.map((lobbyPlayer) => lobbyPlayer.name), error: '' };
    }

    async updateScores(lobbyId: string, questionIndex: number): Promise<void> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby || lobby.id !== lobbyId) {
            return;
        }

        const question = lobby.quiz?.questions[questionIndex];
        if (!question) {
            return;
        }

        lobby.players.forEach((player) => {
            const isCorrect = player.questions[questionIndex].choices.every(
                (playerAnswer, index) => playerAnswer.isCorrect === question.choices[index].isCorrect,
            );
            player.score += isCorrect ? question.points : 0;
            player.isCorrect = isCorrect;
        });

        await this.updateLobby(lobby);
    }
}
