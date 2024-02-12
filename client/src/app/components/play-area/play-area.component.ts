import { Component, HostListener } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { MouseButton } from '@common/constant';
// TODO : Avoir un fichier séparé pour les constantes!

// TODO : Déplacer ça dans un fichier séparé accessible par tous

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent {
    buttonPressed = '';
    private readonly timer = 5;
    private timerId: number;
    constructor(private readonly timeService: TimeService) {
        this.timerId = this.timeService.createTimerById();
    }

    get time(): number {
        return this.timeService.getTimeById(this.timerId);
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.startTimerById(this.timerId, this.timer);
        }
    }
}
