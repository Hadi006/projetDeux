import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { WaitingRoomInfoComponent } from '@app/components/waiting-room-info/waiting-room-info.component';
import { PlayerService } from '@app/services/player.service';
import { Subject } from 'rxjs';

import { WaitingRoomPlayerPageComponent } from './waiting-room-player-page.component';

describe('WaitingRoomPlayerPageComponent', () => {
    let component: WaitingRoomPlayerPageComponent;
    let fixture: ComponentFixture<WaitingRoomPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['leaveGame', 'cleanUp']);
        Object.defineProperty(playerServiceSpy, 'pin', { get: () => '1234', configurable: true });
        Object.defineProperty(playerServiceSpy, 'gameTitle', { get: () => 'Test Game', configurable: true });
        Object.defineProperty(playerServiceSpy, 'players', { get: () => [], configurable: true });
        const startGameSubject = new Subject<void>();
        Object.defineProperty(playerServiceSpy, 'startGameSubject', {
            get: () => {
                return startGameSubject;
            },
            configurable: true,
        });
        const endGameSubject = new Subject<void>();
        Object.defineProperty(playerServiceSpy, 'endGameSubject', {
            get: () => {
                return endGameSubject;
            },
            configurable: true,
        });

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomPlayerPageComponent, WaitingRoomInfoComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: dialogSpy },
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

    it('should alert when game ends', () => {
        playerServiceSpy.endGameSubject.next();
        expect(dialogSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: "La partie n'existe plus" } });
    });

    it('should leave game', () => {
        component.leaveGame();
        expect(playerServiceSpy.leaveGame).toHaveBeenCalled();
        expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to game page when start game is called', (done) => {
        playerServiceSpy.startGameSubject.subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['game-player']);
            done();
        });
        playerServiceSpy.startGameSubject.next();
    });

    it('should unsubscribe on destroy', (done) => {
        component.ngOnDestroy();
        playerServiceSpy.startGameSubject.subscribe(() => {
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });
        playerServiceSpy.startGameSubject.next();
        playerServiceSpy.endGameSubject.subscribe(() => {
            expect(dialogSpy.open).not.toHaveBeenCalled();
            done();
        });
        playerServiceSpy.endGameSubject.next();
    });
});
