import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { BehaviorSubject } from 'rxjs';

describe('GameplayPlayerPageComponent', () => {
    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['startGame'], {
            stateSubject: new BehaviorSubject<GameState>(GameState.ShowQuestion),
        });

        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', ['createPlayer']);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent],
            providers: [
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameplayPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create a player', () => {
        playerHandlerServiceSpy.createPlayer.and.returnValue({ score: 0, answerNotifier: new BehaviorSubject<boolean[]>([]) });

        expect(playerHandlerServiceSpy.createPlayer).toHaveBeenCalled();
        expect(component.player).toBeTruthy();
    });

    it('should set showingAnswer to false when the game state is ShowQuestion', () => {
        component.gameHandlerService.stateSubject.next(GameState.ShowQuestion);
        expect(component.showingAnswer).toBeFalse();
    });

    it('should set showingAnswer to true and update score when the game state is ShowAnswer', () => {
        const score = 100;

        component.player.score = score;
        component.gameHandlerService.stateSubject.next(GameState.ShowAnswer);

        expect(component.showingAnswer).toBeTrue();
        expect(component.score).toEqual(score);
    });

    it('should navigate to the home page when the game state is GameEnded', () => {
        component.gameHandlerService.stateSubject.next(GameState.GameEnded);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call gameHandlerService.startGame() when ngOnInit() is called', () => {
        component.ngOnInit();
        expect(gameHandlerServiceSpy.startGame).toHaveBeenCalled();
    });

    it('should unsubscribe from gameStateSubscription when ngOnDestroy() is called', () => {
        component.ngOnDestroy();
        expect(component['gameStateSubscription'].closed).toBeTrue();
    });
});
