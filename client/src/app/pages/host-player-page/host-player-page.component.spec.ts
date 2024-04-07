import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { QuestionComponent } from '@app/components/question/question.component';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { Subject } from 'rxjs';

import { HostPlayerPageComponent } from './host-player-page.component';

describe('HostPlayerPageComponent', () => {
    let component: HostPlayerPageComponent;
    let fixture: ComponentFixture<HostPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

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
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostPlayerPageComponent, QuestionComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HostPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call nextQuestion and endGame when questionEndedSubject and gameEndedSubject emit', () => {
        hostServiceSpy.questionEndedSubject.next();
        expect(hostServiceSpy.nextQuestion).toHaveBeenCalled();
        hostServiceSpy.gameEndedSubject.next();
        expect(hostServiceSpy.endGame).toHaveBeenCalled();
    });
});
