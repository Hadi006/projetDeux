import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Subject } from 'rxjs';

import { PlayerGamePageComponent } from './player-game-page.component';

describe('PlayerGamePageComponent', () => {
    let component: PlayerGamePageComponent;
    let fixture: ComponentFixture<PlayerGamePageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['isConnected', 'gameTitle', 'leaveGame']);
        Object.defineProperty(playerServiceSpy, 'players', {
            get: () => {
                return [];
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
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const eventSubject = new Subject<void>();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['onEvent']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerGamePageComponent, GameCountDownComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog when the endGameSubject emits', () => {
        playerServiceSpy.endGameSubject.subscribe(() => {
            expect(dialogSpy.open).toHaveBeenCalled();
        });
        playerServiceSpy.endGameSubject.next();
    });

    it('stopCountDown should set isCountingDown to false', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
    });

    it('get players should return players from PlayerService', () => {
        const player1 = { id: 1, name: 'Player 1' };
        const player2 = { id: 2, name: 'Player 2' };
        const testPlayers = [player1, player2];
        spyOnProperty(playerServiceSpy, 'players', 'get').and.returnValue(testPlayers.map((player) => player.name));
        expect(component.players).toEqual(['Player 1', 'Player 2']);
    });

    it('gameTitle should return the gameTitle from the playerService', () => {
        Object.defineProperty(playerServiceSpy, 'gameTitle', {
            get: () => {
                return 'test';
            },
            configurable: true,
        });
        expect(component.gameTitle()).toEqual('test');
    });

    it('ngOnInit should redirect to home if not connected or game has ended', () => {
        playerServiceSpy.isConnected.and.returnValue(true);
        Object.defineProperty(playerServiceSpy, 'gameEnded', {
            get: () => {
                return true;
            },
            configurable: true,
        });
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('ngOnDestroy should unsubscribe from the endGameSubscription', () => {
        playerServiceSpy.endGameSubject.subscribe(() => {
            expect(dialogSpy.open).not.toHaveBeenCalled();
        });
        component.ngOnDestroy();
        playerServiceSpy.endGameSubject.next();
    });
});
