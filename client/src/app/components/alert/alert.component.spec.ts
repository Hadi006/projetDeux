import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
    let component: AlertComponent;
    let fixture: ComponentFixture<AlertComponent>;

    beforeEach(() => {
        const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [AlertComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: { message: 'Test message' } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the message', () => {
        const element: HTMLElement = fixture.nativeElement;
        expect(element.textContent).toContain('Test message');
    });
});
