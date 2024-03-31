import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { TEST_PLAYERS } from '@common/constant';
import { Player } from '@common/player';

import { EndgameResultPageComponent } from './endgame-result-page.component';

describe('EndgameResultPageComponent', () => {
    let component: EndgameResultPageComponent;
    let fixture: ComponentFixture<EndgameResultPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [EndgameResultPageComponent, ChatboxComponent, HistogramComponent],
            providers: [{ provide: Router, useValue: routerSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EndgameResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should sort players by score and name', () => {
        const players: Player[] = JSON.parse(JSON.stringify([...TEST_PLAYERS, TEST_PLAYERS[0]]));
        players[0].score = 100;
        players[0].name = 'a';
        players[1].score = 100;
        players[1].name = 'b';
        players[2].score = 50;
        component.ngOnInit();
        players.sort((a, b) => {
            return b.score - a.score || a.name.localeCompare(b.name);
        });
        expect(component.game.players).toEqual(players);
    });

    it('should do nothing if game is undefined', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(component.game).toBeUndefined();
    });

    it('should navigate to home page', () => {
        component.leaveGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should decrement histogram index', () => {
        component.previousHistogram();
        expect(component.currentHistogramIndex).toBe(0);
    });

    it('should increment histogram index', () => {
        component.ngOnInit();
        component.nextHistogram();
        expect(component.currentHistogramIndex).toBe(1);
    });
});
