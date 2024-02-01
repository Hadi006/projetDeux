import { TestBed } from '@angular/core/testing';

import { QuestionHandlerService } from '@app/services/question-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';
import { Player } from '@app/interfaces/player';

describe('QuestionHandlerService', () => {
    let service: QuestionHandlerService;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['players']);
        Object.defineProperty(playerHandlerServiceSpy, 'players', {
            get: () => {
                return [];
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: PlayerHandlerService, useValue: playerHandlerServiceSpy }],
        });
        service = TestBed.inject(QuestionHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('currentQuestion getter should return the current question', () => {
        service.questionsData = QUESTIONS_DATA;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('questionsData setter should set the questionsData and nQuestions', () => {
        service.questionsData = QUESTIONS_DATA;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
        expect(service.nQuestions).toEqual(QUESTIONS_DATA.length);
    });

    it('resetPlayerAnswers should reset the player answers', () => {
        const players = new Map<number, Player>([
            [
                0,
                {
                    score: 0,
                    answer: [true, false],
                    answerConfirmed: true,
                },
            ],
            [
                0,
                {
                    score: 0,
                    answer: [false, true],
                    answerConfirmed: true,
                },
            ],
        ]);
        spyOnProperty(playerHandlerServiceSpy, 'players', 'get').and.returnValue(players);
        service.questionsData = QUESTIONS_DATA;
        service.resetPlayerAnswers();
        players.forEach((player) => {
            expect(player.answer).toEqual([false, false, false, false]);
            expect(player.answerConfirmed).toEqual(false);
        });
    });

    it('nextQuestion should load the next question', () => {
        service.questionsData = QUESTIONS_DATA;
        service.nextQuestion();
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[1]);
    });

});
