import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameTimersComponent } from '@app/components/game-timers/game-timers.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player.service';
import { HostService } from '@app/services/host.service';
import { Game } from '@common/game';
import { of, Subject } from 'rxjs';
import { TEST_GAME_DATA } from '@common/constant';

describe('GameplayPlayerPageComponent', () => {
    let testGame: Game;

    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));

        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['handleSockets', 'joinGame', 'cleanUp', 'getTime']);
        playerServiceSpy.joinGame.and.returnValue(of(''));

        const questionEndedSubject = new Subject<void>();
        const gameEndedSubject = new Subject<void>();
        hostServiceSpy = jasmine.createSpyObj('HostService', ['startGame', 'cleanUp', 'nextQuestion']);
        Object.defineProperty(hostServiceSpy, 'questionEndedSubject', { get: () => questionEndedSubject });
        Object.defineProperty(hostServiceSpy, 'gameEndedSubject', { get: () => gameEndedSubject });
        Object.defineProperty(hostServiceSpy, 'game', { get: () => testGame, configurable: true });

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent, GameTimersComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
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

    it('should navigate to the next question on question ended', (done) => {
        hostServiceSpy.questionEndedSubject.subscribe(() => {
            expect(hostServiceSpy.nextQuestion).toHaveBeenCalled();
            done();
        });

        hostServiceSpy.questionEndedSubject.next();
    });

    it('should navigate to game page on game ended', (done) => {
        hostServiceSpy.gameEndedSubject.subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
            done();
        });

        hostServiceSpy.gameEndedSubject.next();
    });

    it('ngOnInit should navigate to game page if there is no quiz', () => {
        hostServiceSpy.game.quiz = undefined;
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('ngOnInit should handle sockets, create player and start game', (done) => {
        expect(playerServiceSpy.handleSockets).toHaveBeenCalled();
        expect(playerServiceSpy.joinGame).toHaveBeenCalledWith(testGame.pin, 'Test');
        playerServiceSpy.joinGame('1', 'test').subscribe(() => {
            expect(hostServiceSpy.startGame).toHaveBeenCalledWith(0);
            done();
        });
    });

    it('ngOnDestroy should unsubscribe', () => {
        component.ngOnDestroy();
        hostServiceSpy.questionEndedSubject.next();
        hostServiceSpy.gameEndedSubject.next();
        expect(hostServiceSpy.nextQuestion).not.toHaveBeenCalledTimes(2);
        expect(routerSpy.navigate).not.toHaveBeenCalledTimes(2);
    });
});
