import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTimersComponent } from './game-timers.component';

describe('GameTimersComponent', () => {
  let component: GameTimersComponent;
  let fixture: ComponentFixture<GameTimersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameTimersComponent]
    });
    fixture = TestBed.createComponent(GameTimersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
