import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WaitingRoomInfoComponent } from '@app/components/waiting-room-info/waiting-room-info.component';
import { PlayerService } from '@app/services/player.service';
import { Subject } from 'rxjs';

import { WaitingRoomPlayerPageComponent } from './waiting-room-player-page.component';

describe('WaitingRoomPlayerPageComponent', () => {
    let component: WaitingRoomPlayerPageComponent;
    let fixture: ComponentFixture<WaitingRoomPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['leaveGame', 'cleanUp']);
        Object.defineProperty(playerServiceSpy, 'pin', { get: () => '1234', configurable: true });
        Object.defineProperty(playerServiceSpy, 'gameTitle', { get: () => 'Test Game', configurable: true });
        Object.defineProperty(playerServiceSpy, 'players', { get: () => [], configurable: true });
        Object.defineProperty(playerServiceSpy, 'startGameSubject', {
            get: () => {
                return new Subject<void>();
            },
            configurable: true,
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomPlayerPageComponent, WaitingRoomInfoComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should leave game', () => {
        component.leaveGame();
        expect(playerServiceSpy.leaveGame).toHaveBeenCalled();
        expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to game page when start game is called', () => {
        playerServiceSpy.startGameSubject.next();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game-player']);
    });
});
