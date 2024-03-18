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
        const queryParamsMap = of({ game: JSON.stringify(TEST_GAME_DATA) });
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
});
