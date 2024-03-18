import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { PlayerService } from '@app/services/player.service';
import { TEST_GAME_DATA } from '@common/constant';
import { Subject } from 'rxjs';

import { PlayerGamePageComponent } from './player-game-page.component';

describe('PlayerGamePageComponent', () => {
    let component: PlayerGamePageComponent;
    let fixture: ComponentFixture<PlayerGamePageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

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
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerGamePageComponent, GameCountDownComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
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
        playerServiceSpy.endGameSubject.next(TEST_GAME_DATA);
    });

    it('stopCountDown should set isCountingDown to false', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
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
        playerServiceSpy.endGameSubject.next(TEST_GAME_DATA);
    });
});
