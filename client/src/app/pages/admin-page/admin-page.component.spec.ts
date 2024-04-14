import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { PromptComponent } from '@app/components/prompt/prompt.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes/admin-quizzes.service';
import { ActionType } from '@common/action';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let adminService: jasmine.SpyObj<AdminQuizzesService>;
    let router: jasmine.SpyObj<Router>;
    let dialog: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PromptComponent>>;

    beforeEach(async () => {
        adminService = jasmine.createSpyObj('AdminService', [
            'fetchQuizzes',
            'fetchGames',
            'uploadQuiz',
            'changeQuizVisibility',
            'downloadQuiz',
            'deleteQuiz',
            'setSelectedQuiz',
            'submitQuiz',
            'deleteAllGames',
            'deleteGame',
            'sortGamesByName',
            'sortGamesByDate',
        ]);
        router = jasmine.createSpyObj('Router', ['navigate']);
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialog.open.and.returnValue(dialogRefSpy);

        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent, QuestionBankComponent],
            imports: [DragDropModule, MatIconModule, HttpClientTestingModule, FormsModule],
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

    it('should fetch quizzes and games on initialization', () => {
        expect(adminService.fetchQuizzes).toHaveBeenCalled();
        expect(adminService.fetchGames).toHaveBeenCalled();
    });

    it('should upload quiz file and show alert on success', () => {
        const quizFile = new File(['quiz data'], 'quiz.json', { type: 'application/json' });
        const event = { target: { files: [quizFile] } as unknown as HTMLInputElement };
        const response = { data: undefined, error: '' };
        adminService.uploadQuiz.and.returnValue(of(response));

        component.importQuiz(event as unknown as Event);

        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(dialog.open).not.toHaveBeenCalled();
    });

    it('should handle error when uploading quiz file', () => {
        const quizFile = new File(['quiz data'], 'quiz.json', { type: 'application/json' });
        const event = { target: { files: [quizFile] } as unknown as HTMLInputElement };
        const errorResponse = { quiz: undefined, error: 'Error occurred while uploading quiz' };
        adminService.uploadQuiz.and.returnValue(of(errorResponse));

        component.importQuiz(event as unknown as Event);

        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(dialog.open).toHaveBeenCalledWith(AlertComponent, { data: { message: errorResponse.error } });
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
        const response = { quiz: undefined, error: 'Quiz : titre déjà utilisé !\n' };
        adminService.uploadQuiz.and.returnValue(of(response));
        dialogRefSpy.afterClosed.and.returnValue(of('New title'));
        adminService.submitQuiz.and.returnValue(of());

        component.importQuiz(event as unknown as Event);

        expect(dialog.open).toHaveBeenCalledWith(PromptComponent, { data: { message: 'Veuillez entrer un nouveau titre pour le quiz' } });
        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(adminService.submitQuiz).toHaveBeenCalledWith(response.quiz, 'New title');
    });

    it('should do nothing when prompt for new title is cancelled', () => {
        const quizFile = new File(['quiz data'], 'quiz.json', { type: 'application/json' });
        const event = { target: { files: [quizFile] } as unknown as HTMLInputElement };
        const response = { data: undefined, error: 'Quiz : titre déjà utilisé !\n' };
        adminService.uploadQuiz.and.returnValue(of(response));
        dialogRefSpy.afterClosed.and.returnValue(of(''));
        adminService.submitQuiz.and.returnValue(of());

        component.importQuiz(event as unknown as Event);

        expect(dialog.open).toHaveBeenCalledWith(PromptComponent, { data: { message: 'Veuillez entrer un nouveau titre pour le quiz' } });
        expect(adminService.uploadQuiz).toHaveBeenCalledWith(quizFile);
        expect(adminService.submitQuiz).not.toHaveBeenCalled();
    });

    it('should navigate to quiz page when goToQuizPage is called', () => {
        component.goToQuizPage(0);
        expect(router.navigate).toHaveBeenCalledWith(['/home/admin/quizzes/quiz']);
    });

    it('should navigate to quiz page with invalid index when goToQuizPage is called with undefined index', () => {
        component.goToQuizPage();
        expect(router.navigate).toHaveBeenCalledWith(['/home/admin/quizzes/quiz']);
    });

    it('should handle change visibility', () => {
        component.handle({ type: ActionType.CHANGE_VISIBILITY, target: 0 });
        expect(adminService.changeQuizVisibility).toHaveBeenCalledWith(0);
    });

    it('should handle edit', () => {
        component.handle({ type: ActionType.EDIT, target: 0 });
        expect(adminService.setSelectedQuiz).toHaveBeenCalledWith(0);
        expect(router.navigate).toHaveBeenCalledWith(['/home/admin/quizzes/quiz']);
    });

    it('should call deleteQuiz when delete action is handled', () => {
        const action = { type: ActionType.DELETE, target: 123 };
        const expectedIndex = 123;
        component.handle(action);
        expect(adminService.deleteQuiz).toHaveBeenCalledWith(expectedIndex);
    });

    it('should call dowloadQuiz when export action is handled', () => {
        const action = { type: ActionType.EXPORT, target: 123 };
        const expectedIndex = 123;
        component.handle(action);
        expect(adminService.downloadQuiz).toHaveBeenCalledWith(expectedIndex);
    });

    it('should do nothing when handle is called with an invalid type', () => {
        const action = { type: 'invalid' as ActionType, target: 123 };
        component.handle(action);
        expect(adminService.changeQuizVisibility).not.toHaveBeenCalled();
        expect(adminService.deleteQuiz).not.toHaveBeenCalled();
        expect(adminService.downloadQuiz).not.toHaveBeenCalled();
    });

    it('should delete all games', () => {
        component.deleteAllGames();
        expect(adminService.deleteAllGames).toHaveBeenCalled();
    });

    it('should delete game', () => {
        component.deleteGame(0);
        expect(adminService.deleteGame).toHaveBeenCalledWith(0);
    });

    it('should sort games by name', () => {
        component.sortByName();
        expect(adminService.sortGamesByName).toHaveBeenCalled();
    });

    it('should sort by date', () => {
        component.sortByDate();
        expect(adminService.sortGamesByDate).toHaveBeenCalled();
    });
});
