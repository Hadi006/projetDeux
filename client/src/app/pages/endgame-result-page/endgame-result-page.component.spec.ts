import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TEST_GAME_DATA } from '@common/constant';
import { of } from 'rxjs';

import { EndgameResultPageComponent } from './endgame-result-page.component';

describe('EndgameResultPageComponent', () => {
    let component: EndgameResultPageComponent;
    let fixture: ComponentFixture<EndgameResultPageComponent>;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const queryParamsMap = of({});
        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            queryParams: queryParamsMap,
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [EndgameResultPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: Router, useValue: routerSpy },
            ],
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
        routeSpy.queryParams = of({ game: JSON.parse(JSON.stringify(TEST_GAME_DATA)) });
        const players = [
            { name: 'c', score: 1 },
            { name: 'a', score: 2 },
            { name: 'b', score: 2 },
        ];
        const sortedPlayers = players.sort((a, b) => {
            return b.score - a.score || a.name.localeCompare(b.name);
        });
        expect(sortedPlayers).toEqual([
            { name: 'a', score: 2 },
            { name: 'b', score: 2 },
            { name: 'c', score: 1 },
        ]);
    });

    it('should do nothing if game is undefined', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(component.game).toBeUndefined();
    });
});
