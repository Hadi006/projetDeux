import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player/player.service';
import { of } from 'rxjs';

import { JoinRoomPageComponent } from './join-room-page.component';

describe('JoinRoomPageComponent', () => {
    let component: JoinRoomPageComponent;
    let fixture: ComponentFixture<JoinRoomPageComponent>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['cleanUp', 'joinGame', 'handleSockets']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [JoinRoomPageComponent],
            imports: [FormsModule],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should join game', (done) => {
        component.gamePin = '12345';
        component.playerName = 'test';
        playerServiceSpy.joinGame.and.returnValue(of(''));
        component.joinGame();
        expect(playerServiceSpy.joinGame).toHaveBeenCalledWith('12345', { playerName: 'test', isHost: false });
        playerServiceSpy.joinGame('', { playerName: '', isHost: false }).subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['waiting-room-player']);
            done();
        });
    });

    it('should not join game', (done) => {
        component.gamePin = '12345';
        component.playerName = 'test';
        playerServiceSpy.joinGame.and.returnValue(of('error'));
        component.joinGame();
        expect(playerServiceSpy.joinGame).toHaveBeenCalledWith('12345', { playerName: 'test', isHost: false });
        playerServiceSpy.joinGame('', { playerName: '', isHost: false }).subscribe(() => {
            expect(routerSpy.navigate).not.toHaveBeenCalled();
            done();
        });
    });

    it('should clean up', () => {
        component.return();
        expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
