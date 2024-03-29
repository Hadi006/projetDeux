import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';

@Component({
    selector: 'app-waiting-room-info',
    templateUrl: './waiting-room-info.component.html',
    styleUrls: ['./waiting-room-info.component.scss'],
})
export class WaitingRoomInfoComponent implements OnInit {
    @Input() title: string;
    @Input() pin: string;
    @Input() nPlayers: number;
    @Input() leaveGame: () => void;

    constructor(
        private chatService: ChatService,
        private hostService: HostService,
        private playerService: PlayerService,
    ) {}

    ngOnInit() {
        if (this.hostService.game || this.playerService.player) {
            this.chatService.init();
        }
    }
}
