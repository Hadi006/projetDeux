import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomInfoComponent } from './waiting-room-info.component';

describe('WaitingRoomInfoComponent', () => {
  let component: WaitingRoomInfoComponent;
  let fixture: ComponentFixture<WaitingRoomInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitingRoomInfoComponent]
    });
    fixture = TestBed.createComponent(WaitingRoomInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
