import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostPlayerPageComponent } from './host-player-page.component';

describe('HostPlayerPageComponent', () => {
  let component: HostPlayerPageComponent;
  let fixture: ComponentFixture<HostPlayerPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostPlayerPageComponent]
    });
    fixture = TestBed.createComponent(HostPlayerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
