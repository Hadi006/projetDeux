import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { WaitingRoomHostPageComponent } from './waiting-room-host-page.component';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;
    let hostService: jasmine.SpyObj<HostService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        hostService = jasmine.createSpyObj('HostService', ['isConnected', 'toggleLock', 'kick', 'startGame']);
        Object.defineProperty(hostService, 'game', { get: jasmine.createSpy('game getter') });

        router = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomHostPageComponent],
            providers: [
                { provide: HostService, useValue: hostService },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to root if not connected or game is locked', () => {
        hostService.isConnected.and.returnValue(false);
        component.ngOnInit();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should toggle lock', () => {
        component.toggleLock();
        expect(hostService.toggleLock).toHaveBeenCalled();
    });

    it('should kick player', () => {
        component.kick('player1');
        expect(hostService.kick).toHaveBeenCalledWith('player1');
    });

    it('should start game', () => {
        component.startGame();
        expect(router.navigate).toHaveBeenCalledWith(['game-host']);
        expect(hostService.startGame).toHaveBeenCalled();
    });
});
