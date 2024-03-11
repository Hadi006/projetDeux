import { HttpStatusCode, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Question } from '@common/quiz';
import { of } from 'rxjs';
import { CommunicationService } from './communication.service';
import { PlayerHandlerService } from './player-handler.service';

describe('PlayerHandlerService', () => {
    const TEST_QUESTIONS: Question[] = [
        {
            id: '0',
            points: 10,
            text: '1+1?',
            choices: [
                {
                    text: '1',
                    isCorrect: false,
                },
                {
                    text: '2',
                    isCorrect: false,
                },
                {
                    text: '3',
                    isCorrect: false,
                },
            ],
            type: 'QCM',
        },
    ];

    let service: PlayerHandlerService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['post']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
            ],
        });
        service = TestBed.inject(PlayerHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createPlayer should create a player', () => {
        const player = service.createPlayer();
        expect(player).toBeTruthy();
        expect(service.player).toEqual(player);
    });

    it('handleKeyUp should confirm the answer if Enter is pressed', () => {
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        spyOn(service, 'confirmPlayerAnswer');
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }), player);
        expect(service.confirmPlayerAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle the answer if a number key is pressed', () => {
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        player.questions[0].choices.forEach((choice) => {
            choice.isCorrect = false;
        });
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }), player);
        expect(player.questions[0].choices[0].isCorrect).toBeTrue();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }), player);
        expect(player.questions[0].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a number key is pressed out of range', () => {
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '0' }), player);
        expect(player.questions[0].choices[0].isCorrect).toBeFalse();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '4' }), player);
        expect(player.questions[0].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a non-number key is pressed', () => {
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        player.questions[0].choices.forEach((choice) => {
            choice.isCorrect = true;
        });
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'a' }), player);
        player.questions[0].choices.forEach((choice) => {
            expect(choice.isCorrect).toBeTrue();
        });
    });

    it('confirmPlayerAnswer should do nothing if player is undefined', () => {
        service.createPlayer();
        spyOn(service.allAnsweredSubject, 'next');
        service.confirmPlayerAnswer(undefined);
        expect(service.allAnsweredSubject.next).not.toHaveBeenCalled();
    });

    it('confirmPlayerAnswer should confirm the answer and notify the subscribers', () => {
        service.createPlayer();
        spyOn(service.allAnsweredSubject, 'next');
        service.confirmPlayerAnswer(service.player);
        expect(service.allAnsweredSubject.next).toHaveBeenCalled();
    });

    it('confirmPlayerAnswer should increment nAnswered and reset it if all players confirmed', () => {
        service.createPlayer();
        spyOn(service.allAnsweredSubject, 'next');
        service.confirmPlayerAnswer(service.player);
        expect(service.allAnsweredSubject.next).toHaveBeenCalledTimes(1);
        service.confirmPlayerAnswer(service.player);
        expect(service.allAnsweredSubject.next).toHaveBeenCalledTimes(2);
    });

    it('resetPlayerAnswers should reset all players answers and answerConfirmed', () => {
        service.createPlayer();
        service.resetPlayerAnswers(TEST_QUESTIONS[0]);
        service.player.questions[0].choices.forEach((choice) => {
            expect(choice.isCorrect).toBeFalse();
        });
    });

    it('validatePlayerAnswers increase the score when status is ok', () => {
        const points = 10;
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        const questionText = '1234';
        const httpResponse: HttpResponse<boolean> = new HttpResponse({ status: HttpStatusCode.Ok, body: true });
        communicationServiceSpy.post.and.returnValues(of(httpResponse));
        service.validatePlayerAnswers(questionText, points);
        expect(service.player.score).toBe(points);
    });

    it('validatePlayerAnswers should not increase the score if status is not ok', () => {
        const points = 10;
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        const questionText = '1234';
        const httpResponse: HttpResponse<boolean> = new HttpResponse({ status: HttpStatusCode.BadRequest, body: true });
        communicationServiceSpy.post.and.returnValues(of(httpResponse));
        service.validatePlayerAnswers(questionText, points);
        expect(service.player.isCorrect).toBeFalse();
        expect(service.player.score).toBe(0);
    });

    it('validatePlayerAnswers should not increase the score if body is false', () => {
        const points = 10;
        const player = service.createPlayer();
        player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        const questionText = '1234';
        const httpResponse: HttpResponse<boolean> = new HttpResponse({ status: HttpStatusCode.Ok, body: false });
        communicationServiceSpy.post.and.returnValues(of(httpResponse));
        service.validatePlayerAnswers(questionText, points);
        expect(service.player.isCorrect).toBeFalse();
        expect(service.player.score).toBe(0);
    });
});
