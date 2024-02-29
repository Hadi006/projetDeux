import { Component } from '@angular/core';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent {
    /**
     * Displays an alert message.
     */
    alertMessage(title: string, message: string): void {
        return;
    }
    /**
     * Configures the basic socket features.
     */
    configureBaseSocketFeatures(): void {
        return;
    }

    /**
     * Loads game data.
     */
    loadGameData(): void {
        return;
    }
    /**
     * Asks for game data.
     */
    askGameData(): void {
        return;
    }
    /**
     * Sets the timer for game start.
     */

    setTimer(): void {
        return;
    }
    /**
     * Starts the game.
     */
    startGame(): void {
        return;
    }
    /**
     * Toggles room accessibility.
     */
    toggleRoomAccessibility(): void {
        return;
    }
    /**
     * Selects a player.
     */
    selectPlayer(selectedPlayer: Player): void {
        return;
    }
    /**
     * Bans the selected player.
     */
    banSelectedPlayer(): void {
        return;
    }
    /**
     * Confirms quitting the room.
     */
    confirmQuit(): void {
        return;
    }
}
