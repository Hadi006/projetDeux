import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { PlayerService } from '@app/services/player.service';
import { WebSocketService } from '@app/services/web-socket.service';
import { Subject } from 'rxjs';

import { PlayerGamePageComponent } from './player-game-page.component';

describe('PlayerGamePageComponent', () => {
    let component: PlayerGamePageComponent;
    let fixture: ComponentFixture<PlayerGamePageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['gameTitle', 'leaveGame']);
        const endGameSubject = new Subject<void>();
        Object.defineProperty(playerServiceSpy, 'endGameSubject', {
            get: () => {
                return endGameSubject;
            },
            configurable: true,
        });
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['onEvent']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerGamePageComponent, GameCountDownComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
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

    it('leaveGame should call leaveGame method from PlayerService', () => {
        component.leaveGame();
        expect(playerServiceSpy.leaveGame).toHaveBeenCalled();
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

    it('ngOnDestroy should unsubscribe from the endGameSubscription', () => {
        playerServiceSpy.endGameSubject.subscribe(() => {
            expect(dialogSpy.open).not.toHaveBeenCalled();
        });
        component.ngOnDestroy();
        playerServiceSpy.endGameSubject.next();
    });
});
