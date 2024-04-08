import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { WaitingRoomInfoComponent } from '@app/components/waiting-room-info/waiting-room-info.component';
import { PlayerService } from '@app/services/player/player.service';
import { RANDOM_QUIZ_ID } from '@common/constant';
import { Subject } from 'rxjs';

import { WaitingRoomPlayerPageComponent } from './waiting-room-player-page.component';

describe('WaitingRoomPlayerPageComponent', () => {
    let component: WaitingRoomPlayerPageComponent;
    let fixture: ComponentFixture<WaitingRoomPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['isConnected', 'cleanUp']);
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

        const eventSubject = new Subject<void>();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomPlayerPageComponent, WaitingRoomInfoComponent, ChatboxComponent],
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
        expect(component.pin).toBeTruthy();
        expect(component.gameTitle).toBeTruthy();
        expect(component.players).toBeTruthy();
    });

    it('should navigate to home page when disconnected', () => {
        playerServiceSpy.isConnected.and.returnValue(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not navigate to home page when connected', () => {
        playerServiceSpy.isConnected.and.returnValue(true);
        component.ngOnInit();
        expect(routerSpy.navigate).not.toHaveBeenCalledTimes(2);
    });

    it('should alert when game ends', () => {
        playerServiceSpy.endGameSubject.next();
        expect(dialogSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: "La partie n'existe plus" } });
    });

    it('should navigate to game page when start game is called', (done) => {
        playerServiceSpy.startGameSubject.subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['game-player']);
            done();
        });
        playerServiceSpy.startGameSubject.next();
    });

    it('should navigate to host player page when start game is called and game id is -1', (done) => {
        Object.defineProperty(playerServiceSpy, 'gameId', { get: () => RANDOM_QUIZ_ID });
        playerServiceSpy.startGameSubject.subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['host-player']);
            done();
        });
        playerServiceSpy.startGameSubject.next();
    });

    it('should unsubscribe on destroy', (done) => {
        component.ngOnDestroy();
        playerServiceSpy.startGameSubject.subscribe(() => {
            expect(routerSpy.navigate).not.toHaveBeenCalledTimes(2);
        });
        playerServiceSpy.startGameSubject.next();
        playerServiceSpy.endGameSubject.subscribe(() => {
            expect(dialogSpy.open).not.toHaveBeenCalled();
            done();
        });
        playerServiceSpy.endGameSubject.next();
    });
});
