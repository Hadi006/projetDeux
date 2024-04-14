import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { START_GAME_COUNTDOWN } from '@common/constant';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-player-page',
    templateUrl: './host-player-page.component.html',
    styleUrls: ['./host-player-page.component.scss'],
})
export class HostPlayerPageComponent implements OnInit, OnDestroy {
    @ViewChild(ChatboxComponent) chatbox: ChatboxComponent;

    isCountingDown = true;

    private questionEndedSubscription: Subscription;
    private gameEndedSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private hostService: HostService,
        private router: Router,
    ) {
        this.questionEndedSubscription = this.hostService.questionEndedSubject.subscribe(() => {
            this.hostService.nextQuestion();
        });
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.hostService.endGame();
        });
    }

    stopCountDown() {
        this.isCountingDown = false;
    }

    gameTitle() {
        return this.playerService.gameTitle;
    }

    ngOnInit() {
        if (!this.hostService.isConnected() || this.playerService.gameEnded) {
            this.router.navigate(['/']);
            return;
        }

        this.hostService.handleSockets();
        this.hostService.requestGame(this.playerService.pin).subscribe(() => {
            this.hostService.startGame(START_GAME_COUNTDOWN);
        });
    }

    leaveGame() {
        this.hostService.cleanUp();
        this.playerService.cleanUp();
        this.router.navigate(['/']);
    }

    ngOnDestroy() {
        this.questionEndedSubscription.unsubscribe();
        this.gameEndedSubscription.unsubscribe();
    }
}
