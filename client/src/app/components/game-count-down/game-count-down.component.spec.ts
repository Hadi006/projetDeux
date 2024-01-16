import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCountDownComponent } from './game-count-down.component';

describe('GameCountDownComponent', () => {
  let component: GameCountDownComponent;
  let fixture: ComponentFixture<GameCountDownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameCountDownComponent]
    });
    fixture = TestBed.createComponent(GameCountDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
