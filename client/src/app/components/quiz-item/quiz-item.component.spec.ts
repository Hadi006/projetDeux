import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { QuizItemComponent } from './quiz-item.component';

describe('QuizItemComponent', () => {
    let component: QuizItemComponent;
    let fixture: ComponentFixture<QuizItemComponent>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [QuizItemComponent],
            imports: [BrowserAnimationsModule],
            providers: [{ provide: MatDialog, useValue: dialogSpy }],
        }).compileComponents();

        mockMatDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuizItemComponent);
        component = fixture.componentInstance;
        component.index = 0;
        component.quiz = {
            id: '1',
            title: 'Mock Quiz',
            visible: true,
            description: 'Mock Quiz Description',
            lastModification: new Date(),
            duration: 0,
            questions: [],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open confirmation dialog for edit action', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);

        component.openConfirmationDialog('edit');

        expect(mockMatDialog.open).toHaveBeenCalledOnceWith(jasmine.any(Function), {
            width: '250px',
            data: 'Êtes-vous sûr de vouloir modifier ce quiz?',
        });
    });

    it('should emit action for edit when user confirms in confirmation dialog', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);

        spyOn(component.action, 'emit');

        component.openConfirmationDialog('edit');

        expect(component.action.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({ type: 'edit', target: 0 }));
    });

    it('should emit action for export when user confirms in confirmation dialog', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);

        spyOn(component.action, 'emit');

        component.openConfirmationDialog('export');

        expect(component.action.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({ type: 'export', target: 0 }));
    });

    it('should emit action for delete when user confirms in confirmation dialog', () => {
        const mockDialogRef = jasmine.createSpyObj(['afterClosed']);
        mockDialogRef.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(mockDialogRef);

        spyOn(component.action, 'emit');

        component.openConfirmationDialog('delete');

        expect(component.action.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({ type: 'delete', target: 0 }));
    });
});
