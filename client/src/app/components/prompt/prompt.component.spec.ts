import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PromptComponent } from './prompt.component';

describe('PromptComponent', () => {
    let component: PromptComponent;
    let fixture: ComponentFixture<PromptComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PromptComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: { message: 'test' } },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PromptComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.data.message).toBe('test');
    });

    it('should close the dialog when onCancel is called', () => {
        component.onCancel();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should close the dialog with the user input when onConfirm is called', () => {
        component.userInput = 'test';
        component.onConfirm();
        expect(dialogRefSpy.close).toHaveBeenCalledWith('test');
    });
});
