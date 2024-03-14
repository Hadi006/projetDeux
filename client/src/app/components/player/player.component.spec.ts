import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { PlayerService } from '@app/services/player.service';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameTimersComponent } from '@app/components/game-timers/game-timers.component';
import { QuestionComponent } from '@app/components/question/question.component';

import { PlayerComponent } from './player.component';

describe('PlayerComponent', () => {
    let component: PlayerComponent;
    let fixture: ComponentFixture<PlayerComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['cleanUp', 'getTime']);
        hostServiceSpy = jasmine.createSpyObj('HostService', ['cleanUp']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerComponent, GameTimersComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnDestroy should clean up', () => {
        component.ngOnDestroy();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
    });
});
