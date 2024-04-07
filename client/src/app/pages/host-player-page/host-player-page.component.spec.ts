import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { QuestionComponent } from '@app/components/question/question.component';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';

import { HostPlayerPageComponent } from './host-player-page.component';

describe('HostPlayerPageComponent', () => {
    let component: HostPlayerPageComponent;
    let fixture: ComponentFixture<HostPlayerPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['cleanUp']);
        hostServiceSpy = jasmine.createSpyObj('HostService', [
            'cleanUp',
            'isConnected',
            'handleSockets',
            'requestGame',
            'startGame',
            'nextQuestion',
            'endGame',
        ]);
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
});
