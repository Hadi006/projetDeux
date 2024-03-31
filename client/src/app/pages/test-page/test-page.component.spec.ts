import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { TEST_GAME_DATA } from '@common/constant';
import { Game } from '@common/game';
import { Subject, of } from 'rxjs';

describe('TestPageComponent', () => {
    let testGame: Game;

    let component: TestPageComponent;
    let fixture: ComponentFixture<TestPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));

        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['isConnected', 'handleSockets', 'joinGame', 'cleanUp', 'getTime']);
        playerServiceSpy.joinGame.and.returnValue(of(''));

        const questionEndedSubject = new Subject<void>();
        const gameEndedSubject = new Subject<Game>();
        hostServiceSpy = jasmine.createSpyObj('HostService', ['isConnected', 'startGame', 'cleanUp', 'nextQuestion']);
        Object.defineProperty(hostServiceSpy, 'questionEndedSubject', { get: () => questionEndedSubject });
        Object.defineProperty(hostServiceSpy, 'gameEndedSubject', { get: () => gameEndedSubject });
        Object.defineProperty(hostServiceSpy, 'game', { get: () => testGame, configurable: true });

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['onEvent']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TestPageComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestPageComponent);
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
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home/create-game']);
            done();
        });

        hostServiceSpy.gameEndedSubject.next();
    });

    it('ngOnInit should handle sockets, create player and start game', (done) => {
        hostServiceSpy.isConnected.and.returnValue(true);
        component.ngOnInit();
        expect(playerServiceSpy.handleSockets).toHaveBeenCalled();
        expect(playerServiceSpy.joinGame).toHaveBeenCalledWith(testGame.pin, 'Test');
        playerServiceSpy.joinGame('1', 'test').subscribe(() => {
            expect(hostServiceSpy.startGame).toHaveBeenCalledWith(0);
            done();
        });
    });

    it('ngOnDestroy should unsubscribe', () => {
        component.ngOnDestroy();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
        hostServiceSpy.questionEndedSubject.next();
        hostServiceSpy.gameEndedSubject.next();
        expect(hostServiceSpy.nextQuestion).not.toHaveBeenCalledTimes(2);
        expect(routerSpy.navigate).not.toHaveBeenCalledTimes(2);
    });
});
