import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EndgameResultPageComponent } from './endgame-result-page.component';

describe('EndgameResultPageComponent', () => {
    let component: EndgameResultPageComponent;
    let fixture: ComponentFixture<EndgameResultPageComponent>;
    let routeStub: Partial<ActivatedRoute>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routeStub = {
            queryParams: of({ game: JSON.stringify({ players: [], histograms: [] }) }),
        };
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            declarations: [EndgameResultPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: routeStub },
                { provide: Router, useValue: routerSpy },
            ],
        });
        fixture = TestBed.createComponent(EndgameResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set game property if game data exists in query parameters', () => {
        fixture.detectChanges();
        expect(component.game).toBeDefined();
    });

    it('should sort players by score and name if game data exists in query parameters', () => {
        fixture.detectChanges();
        expect(component.game.players).toEqual([]);
    });

    it('should not set game property if game data does not exist in query parameters', () => {
        routeStub.queryParams = of({});
        fixture.detectChanges();
        expect(component.game).toBeUndefined();
    });

    it('should navigate to home page when leaveGame method is called', () => {
        component.leaveGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should decrease currentHistogramIndex when previousHistogram method is called', () => {
        component.currentHistogramIndex = 2;
        component.previousHistogram();
        expect(component.currentHistogramIndex).toBe(1);
    });

    it('should increase currentHistogramIndex when nextHistogram method is called', () => {
        component.currentHistogramIndex = 0;
        component.game = {
            players: [],
            pin: '1234',
            hostId: 'host123',
            locked: false,
            bannedNames: [],
            histograms: [
                {
                    labels: ['Label1', 'Label2', 'Label3'],
                    datasets: [
                        { label: 'Dataset1', data: [1, 2, 3] },
                        { label: 'Dataset2', data: [4, 5, 6] },
                    ],
                },
            ],
        };
        component.nextHistogram();
        expect(component.currentHistogramIndex).toBe(1);
    });
});
