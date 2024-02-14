import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { of } from 'rxjs';
import { AdminQuizzesService } from 'src/app/services/admin-quizzes.service';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let adminService: jasmine.SpyObj<AdminQuizzesService>;
    let router: jasmine.SpyObj<Router>;
    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        adminService = jasmine.createSpyObj('AdminService', [
            'fetchQuizzes',
            'uploadQuiz',
            'changeQuizVisibility',
            'downloadQuiz',
            'deleteQuiz',
            'setSelectedQuiz',
            'submitQuiz',
        ]);
        router = jasmine.createSpyObj('Router', ['navigate']);
        dialog = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent, QuestionBankComponent],
            imports: [DragDropModule, MatIconModule, HttpClientTestingModule],
            providers: [
                { provide: AdminQuizzesService, useValue: adminService },
                { provide: Router, useValue: router },
                { provide: MatDialog, useValue: dialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should fetch quizzes on initialization', () => {
        expect(adminService.fetchQuizzes).toHaveBeenCalled();
    });

    it('should upload quiz file and show alert on success', () => {
        const quizFile = new File(['quiz data'], 'quiz.json', { type: 'application/json' });
        const event = { target: { files: [quizFile] } as unknown as HTMLInputElement };
        const response = { quiz: undefined, errorLog: '' };
        adminService.uploadQuiz.and.returnValue(of(response));

        component.importQuiz(event as unknown as Event);

        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(dialog.open).not.toHaveBeenCalled();
    });

    it('should handle error when uploading quiz file', () => {
        const quizFile = new File(['quiz data'], 'quiz.json', { type: 'application/json' });
        const event = { target: { files: [quizFile] } as unknown as HTMLInputElement };
        const errorResponse = { quiz: undefined, errorLog: 'Error occurred while uploading quiz' };
        adminService.uploadQuiz.and.returnValue(of(errorResponse));

        component.importQuiz(event as unknown as Event);

        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(dialog.open).toHaveBeenCalledWith(AlertComponent, { data: { message: errorResponse.errorLog } });
    });

    it('should do nothing when importQuiz is called with undefined event', () => {
        const event = { target: { files: undefined } as unknown as HTMLInputElement };

        component.importQuiz(event as unknown as Event);

        expect(adminService.uploadQuiz).not.toHaveBeenCalled();
        expect(dialog.open).not.toHaveBeenCalled();
    });

    it('should prompt for new title and submit quiz when title must be unique', () => {
        const quizFile = new File(['quiz data'], 'quiz.json', { type: 'application/json' });
        const event = { target: { files: [quizFile] } as unknown as HTMLInputElement };
        const response = { quiz: undefined, errorLog: 'Quiz : titre déjà utilisé !\n' };
        adminService.uploadQuiz.and.returnValue(of(response));
        spyOn(window, 'prompt').and.returnValue('New title');
        adminService.submitQuiz.and.returnValue(of());

        component.importQuiz(event as unknown as Event);

        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(adminService.submitQuiz).toHaveBeenCalledWith(response.quiz, 'New title');
    });

    it('should set selected quiz and navigate to correct URL with index', () => {
        const index = 1;
        component.gotoQuizPage(index);
        expect(adminService.setSelectedQuiz).toHaveBeenCalledWith(index);
        expect(router.navigate).toHaveBeenCalledWith(['/home/admin/quizzes/quiz']);
    });

    it('should set selected quiz to -1 and navigate to correct URL without index', () => {
        component.gotoQuizPage();
        const invalidIndex = -1;
        expect(adminService.setSelectedQuiz).toHaveBeenCalledWith(invalidIndex);
        expect(router.navigate).toHaveBeenCalledWith(['/home/admin/quizzes/quiz']);
    });

    it('should handle change visibility', () => {
        component.handle({ type: 'change visibility', quizIndex: 0 });
        expect(adminService.changeQuizVisibility).toHaveBeenCalledWith(0);
    });

    it('should call goToQuizPage when edit action is handled', () => {
        spyOn(component, 'gotoQuizPage');
        component.handle({ type: 'edit', quizIndex: 1 });
        expect(component.gotoQuizPage).toHaveBeenCalledWith(1);
    });

    it('should call deleteQuiz when delete action is handled', () => {
        const action = { type: 'delete', quizIndex: 123 };
        const expectedIndex = 123;
        component.handle(action);
        expect(adminService.deleteQuiz).toHaveBeenCalledWith(expectedIndex);
    });

    it('should call dowloadQuiz when export action is handled', () => {
        const action = { type: 'export', quizIndex: 123 };
        const expectedIndex = 123;
        component.handle(action);
        expect(adminService.downloadQuiz).toHaveBeenCalledWith(expectedIndex);
    });

    it('should call nothing when an unknown action is handled', () => {
        const action = { type: 'unknown', quizIndex: 123 };
        component.handle(action);
        expect(adminService.changeQuizVisibility).not.toHaveBeenCalled();
        expect(adminService.downloadQuiz).not.toHaveBeenCalled();
        expect(adminService.deleteQuiz).not.toHaveBeenCalled();
    });
});
