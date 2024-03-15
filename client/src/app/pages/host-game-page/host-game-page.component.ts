import { Component } from '@angular/core';
import { HostService } from '@app/services/host.service';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent {
    constructor(public hostService: HostService) {}
}
