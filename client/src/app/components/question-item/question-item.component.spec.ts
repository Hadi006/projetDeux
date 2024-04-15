import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { QuestionItemComponent } from './question-item.component';

describe('QuestionItemComponent', () => {
    let component: QuestionItemComponent;
    let fixture: ComponentFixture<QuestionItemComponent>;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [QuestionItemComponent],
            imports: [BrowserAnimationsModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: dialogSpy,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { url: ['home', 'admin', 'quizzes'] },
                    },
                },
            ],
        }).compileComponents();

        mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionItemComponent);
        component = fixture.componentInstance;
        component.question = {
            text: 'Mock Question',
            type: 'QCM',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: true },
            ],
            qrlAnswer: '',
        };
        component.index = 0;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open confirmation dialog for edit action', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockDialog.open.and.returnValue(mockDialogRef);

        component.openConfirmationDialog('edit');

        expect(mockDialog.open).toHaveBeenCalledOnceWith(ConfirmationDialogComponent, {
            width: '250px',
            data: 'Êtes-vous sûr de vouloir modifier cette question?',
        });
    });

    it('should emit action for edit when user confirms in confirmation dialog', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockDialog.open.and.returnValue(mockDialogRef);

        spyOn(component.action, 'emit');

        component.openConfirmationDialog('edit');

        expect(component.action.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({ type: 'edit', target: 0 }));
    });

    it('should emit action for delete when user confirms in confirmation dialog', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockDialog.open.and.returnValue(mockDialogRef);

        spyOn(component.action, 'emit');

        component.openConfirmationDialog('delete');

        expect(component.action.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({ type: 'delete', target: 0 }));
    });
});
