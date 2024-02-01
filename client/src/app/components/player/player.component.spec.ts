import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';
import { PlayerHandlerService } from '@app/services/player-handler.service';

import { PlayerComponent } from './player.component';

const TEST_PLAYER: Player = {
    score: 0,
    answer: [false, true, false, false],
    answerConfirmed: false,
};

describe('PlayerComponent', () => {
    let component: PlayerComponent;
    let fixture: ComponentFixture<PlayerComponent>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['createPlayer']);
        playerHandlerServiceSpy.createPlayer.and.returnValue(TEST_PLAYER);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerComponent],
            providers: [{ provide: PlayerHandlerService, useValue: playerHandlerServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create a player', () => {
        expect(playerHandlerServiceSpy.createPlayer).toHaveBeenCalled();
        expect(component.player).toBe(TEST_PLAYER);
    });
});
