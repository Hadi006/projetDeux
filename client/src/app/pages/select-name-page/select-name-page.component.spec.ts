import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectNamePageComponent } from './select-name-page.component';

describe('SelectNamePageComponent', () => {
  let component: SelectNamePageComponent;
  let fixture: ComponentFixture<SelectNamePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectNamePageComponent]
    });
    fixture = TestBed.createComponent(SelectNamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
