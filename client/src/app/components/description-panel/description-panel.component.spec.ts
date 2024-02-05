import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescriptionPanelComponent } from './description-panel.component';
import { SimpleChange } from '@angular/core';

describe('DescriptionPanelComponent', () => {
  let component: DescriptionPanelComponent;
  let fixture: ComponentFixture<DescriptionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DescriptionPanelComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.description).toEqual('');
    expect(component.duration).toEqual('');
    expect(component.questions).toEqual([]);
    expect(component.selectedGame).toBeNull();
  });

  it('should update game info when a valid game is selected', () => {
    component.selectedGame = 'Math';
    component.ngOnChanges({
      selectedGame: new SimpleChange(null, component.selectedGame, true)
    });
    fixture.detectChanges();

    expect(component.description).toEqual('Une série de questions sur les mathématiques.');
    expect(component.duration).toEqual('30 secondes par question');
    expect(component.questions.length).toBeGreaterThan(0);
  });

  it('should clear game info when an invalid game is selected', () => {
    component.selectedGame = 'InvalidGame';
    component.ngOnChanges({
      selectedGame: new SimpleChange(null, component.selectedGame, true)
    });
    fixture.detectChanges();

    expect(component.description).toEqual('Sélectionnez un jeu pour voir sa description, sa durée et ses questions.');
    expect(component.duration).toEqual('');
    expect(component.questions).toEqual([]);
  });

  it('should clear game info when selectedGame is null', () => {
    component.selectedGame = null;
    component.ngOnChanges({
      selectedGame: new SimpleChange('Math', null, false)
    });
    fixture.detectChanges();

    expect(component.description).toEqual('Sélectionnez un jeu pour voir sa description, sa durée et ses questions.');
    expect(component.duration).toEqual('');
    expect(component.questions).toEqual([]);
  });



});