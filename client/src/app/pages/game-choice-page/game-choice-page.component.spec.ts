import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameChoicePageComponent } from './game-choice-page.component';

describe('GameChoicePageComponent', () => {
  let component: GameChoicePageComponent;
  let fixture: ComponentFixture<GameChoicePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameChoicePageComponent]
    });
    fixture = TestBed.createComponent(GameChoicePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
