import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTestingPageComponent } from './game-testing-page.component';

describe('GameTestingPageComponent', () => {
  let component: GameTestingPageComponent;
  let fixture: ComponentFixture<GameTestingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameTestingPageComponent]
    });
    fixture = TestBed.createComponent(GameTestingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
