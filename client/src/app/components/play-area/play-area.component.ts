import { Component, HostListener } from '@angular/core';
import { TimeService } from '@app/services/time.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent {
    buttonPressed = '';
    private readonly timer = 5;
    private timerId: number;
<<<<<<< HEAD
    constructor(private readonly timeService: TimeService) {
        this.timerId = this.timeService.createTimer();
    }
=======
    constructor(private readonly timeService: TimeService) {}
>>>>>>> 0e181e2 (Corrected components that used timers to work with multiple timers)

    get time(): number {
        return this.timeService.getTime(this.timerId);
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
<<<<<<< HEAD
            this.timeService.startTimer(this.timerId, this.timer);
=======
            this.timerId = this.timeService.startTimer(this.timer);
>>>>>>> 0e181e2 (Corrected components that used timers to work with multiple timers)
        }
    }
}
