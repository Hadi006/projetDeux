import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { PlayerService } from '@app/services/player.service';

import { PlayerGamePageComponent } from './player-game-page.component';

describe('PlayerGamePageComponent', () => {
    let component: PlayerGamePageComponent;
    let fixture: ComponentFixture<PlayerGamePageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['gameTitle', 'leaveGame']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerGamePageComponent, GameCountDownComponent, QuestionComponent, ChatboxComponent],
            providers: [{ provide: PlayerService, useValue: playerServiceSpy }],
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
});
