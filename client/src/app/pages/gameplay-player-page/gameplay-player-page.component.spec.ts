import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { BehaviorSubject } from 'rxjs';

describe('GameplayPlayerPageComponent', () => {
    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let gameStateSubjectSpy: BehaviorSubject<GameState>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        gameStateSubjectSpy = new BehaviorSubject<GameState>(GameState.ShowQuestion);
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['stateSubject', 'startGame'], {
            stateSubject: gameStateSubjectSpy,
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent],
            providers: [
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
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

    it('should set answerConfirmed and showingAnswer to false when the game state is ShowQuestion', () => {
        component.gameHandlerService.stateSubject.next(GameState.ShowQuestion);

        expect(component.answerConfirmed).toBeFalse();
        expect(component.showingAnswer).toBeFalse();
    });

    it('should set answerConfirmed and showingAnswer to true when the game state is ShowAnswer', () => {
        component.gameHandlerService.stateSubject.next(GameState.ShowAnswer);

        expect(component.answerConfirmed).toBeTrue();
        expect(component.showingAnswer).toBeTrue();
    });

    it('should navigate to the home page when the game state is GameEnded', () => {
        component.gameHandlerService.stateSubject.next(GameState.GameEnded);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should set answerConfirmed to true when the Enter key is pressed', () => {
        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        component.handleKeyUp(event);

        expect(component.answerConfirmed).toBeTrue();
    });

    it('should not set answerConfirmed to true when a key other than Enter is pressed', () => {
        const event = new KeyboardEvent('keyup', { key: 'Space' });
        component.handleKeyUp(event);

        expect(component.answerConfirmed).toBeFalse();
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
