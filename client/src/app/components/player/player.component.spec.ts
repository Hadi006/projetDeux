import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayerHandlerService } from '@app/services/player-handler.service';

import { PlayerComponent } from './player.component';

describe('PlayerComponent', () => {
    let component: PlayerComponent;
    let fixture: ComponentFixture<PlayerComponent>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['createPlayer']);
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
});
