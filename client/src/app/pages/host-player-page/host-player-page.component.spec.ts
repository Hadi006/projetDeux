import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { ChatService } from '@app/services/chat/chat.service';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { Subject, of } from 'rxjs';

import { ChatMessage } from '@common/chat-message';
import { HostPlayerPageComponent } from './host-player-page.component';

describe('HostPlayerPageComponent', () => {
    let component: HostPlayerPageComponent;
    let fixture: ComponentFixture<HostPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['cleanUp', 'getTime']);
        hostServiceSpy = jasmine.createSpyObj('HostService', [
            'cleanUp',
            'isConnected',
            'handleSockets',
            'requestGame',
            'startGame',
            'nextQuestion',
            'endGame',
        ]);
        const questionEndedSubject = new Subject<void>();
        Object.defineProperty(hostServiceSpy, 'questionEndedSubject', { get: () => questionEndedSubject });
        const gameEndedSubject = new Subject<void>();
        Object.defineProperty(hostServiceSpy, 'gameEndedSubject', { get: () => gameEndedSubject });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        chatServiceSpy = jasmine.createSpyObj('ChatService', ['handleSockets']);
        const newMessageSubject = new Subject<ChatMessage>();
        Object.defineProperty(chatServiceSpy, 'newMessage$', { get: () => newMessageSubject });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostPlayerPageComponent, QuestionComponent, ChatboxComponent, GameCountDownComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ChatService, useValue: chatServiceSpy },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HostPlayerPageComponent);
        component = fixture.componentInstance;
        component.chatbox = jasmine.createSpyObj('ChatboxComponent', ['isFocused']);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should stop counting down when stopCountDown is called', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
    });

    it('should call nextQuestion and endGame when questionEndedSubject and gameEndedSubject emit', () => {
        hostServiceSpy.questionEndedSubject.next();
        expect(hostServiceSpy.nextQuestion).toHaveBeenCalled();
        hostServiceSpy.gameEndedSubject.next();
        expect(hostServiceSpy.endGame).toHaveBeenCalled();
    });

    it('should handleSockets and requestGame when ngOnInit is called', (done) => {
        Object.defineProperty(playerServiceSpy, 'gameEnded', { get: () => false });
        hostServiceSpy.isConnected.and.returnValue(true);
        hostServiceSpy.requestGame.and.returnValue(of(undefined));
        component.ngOnInit();
        expect(hostServiceSpy.handleSockets).toHaveBeenCalled();
        hostServiceSpy.requestGame('').subscribe(() => {
            expect(hostServiceSpy.startGame).toHaveBeenCalled();
            done();
        });
    });

    it('should clean up and navigate to home when leaveGame is called', () => {
        component.leaveGame();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
