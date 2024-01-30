import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';

@Injectable({
    providedIn: 'root',
})
export class GameTimersService {
    constructor(private timeService: TimeService) {}
}
