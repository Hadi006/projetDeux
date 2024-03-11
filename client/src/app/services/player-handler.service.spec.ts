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

    it('createPlayer should create a player and increment nPlayers', () => {
        const nPlayers = service.players.length;
        const player = service.createPlayer();
        expect(player).toBeTruthy();
        expect(service.players.length).toBe(nPlayers + 1);
        expect(service.players[nPlayers]).toEqual(player);
    });

    it('handleKeyUp should confirm the answer if Enter is pressed', () => {
        const player = service.createPlayer();
        player.questions = TEST_QUESTIONS;
        spyOn(service, 'confirmPlayerAnswer');
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }), player);
        expect(service.confirmPlayerAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle the answer if a number key is pressed', () => {
        const player = service.createPlayer();
        player.questions = TEST_QUESTIONS;
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
        player.questions = TEST_QUESTIONS;
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '0' }), player);
        expect(player.questions[0].choices[0].isCorrect).toBeFalse();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '4' }), player);
        expect(player.questions[0].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a non-number key is pressed', () => {
        const player = service.createPlayer();
        player.questions = TEST_QUESTIONS;
        player.questions[0].choices.forEach((choice) => {
            choice.isCorrect = true;
        });
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'a' }), player);
        player.questions[0].choices.forEach((choice) => {
            expect(choice.isCorrect).toBeTrue();
        });
    });

    it('confirmPlayerAnswer should do nothing if player is undefined', () => {
        const player = service.createPlayer();
        player.answerConfirmed = false;
        spyOn(service.allAnsweredSubject, 'next');
        service.confirmPlayerAnswer(undefined);
        expect(player.answerConfirmed).toBeFalse();
        expect(service.allAnsweredSubject.next).not.toHaveBeenCalled();
    });

    it('confirmPlayerAnswer should confirm the answer and notify the subscribers if all players confirmed', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            service.createPlayer();
        }
        spyOn(service.allAnsweredSubject, 'next');
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players[i]);
            expect(service.players[i].answerConfirmed).toBeTrue();
        }
        expect(service.allAnsweredSubject.next).toHaveBeenCalled();
    });

    it('confirmPlayerAnswer should increment nAnswered and reset it if all players confirmed', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            service.createPlayer();
        }
        spyOn(service.allAnsweredSubject, 'next');
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players[i]);
        }
        expect(service.allAnsweredSubject.next).toHaveBeenCalledTimes(1);
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players[i]);
        }
        expect(service.allAnsweredSubject.next).toHaveBeenCalledTimes(2);
    });

    it('updateScores should update the scores of all players', () => {
        const nPlayers = 3;
        const points = 10;
        for (let i = 0; i < nPlayers; i++) {
            const player = service.createPlayer();
            player.isCorrect = i % 2 === 0;
        }
        service.updateScores(points);
        service.players.forEach((player) => {
            if (player.isCorrect) {
                expect(player.score).toBe(points);
            } else {
                expect(player.score).toBe(0);
            }
        });
    });

    it('resetPlayerAnswers should reset all players answers and answerConfirmed', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            const player = service.createPlayer();
            player.answerConfirmed = true;
        }
        service.resetPlayerAnswers(TEST_QUESTIONS[0]);
        service.players.forEach((player) => {
            player.questions[0].choices.forEach((choice) => {
                expect(choice.isCorrect).toBeFalse();
            });
            expect(player.answerConfirmed).toBeFalse();
        });
    });

    it('validatePlayerAnswers should validate the answers of all players when the status is ok', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            service.createPlayer();
            service.players[i].questions = TEST_QUESTIONS;
        }
        const questionText = '1234';
        const httpResponses: HttpResponse<boolean>[] = [
            new HttpResponse({ status: HttpStatusCode.Ok, body: true }),
            new HttpResponse({ status: HttpStatusCode.Ok, body: false }),
            new HttpResponse({ status: HttpStatusCode.Ok, body: true }),
        ];
        communicationServiceSpy.post.and.returnValues(of(httpResponses[0]), of(httpResponses[1]), of(httpResponses[2]));
        service.validatePlayerAnswers(questionText).subscribe(() => {
            expect(service.players[0].isCorrect).toBeTrue();
            expect(service.players[1].isCorrect).toBeFalse();
            expect(service.players[2].isCorrect).toBeTrue();
        });
    });

    it('validatePlayerAnswers should validate the answers of all players when the status is not ok', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            service.createPlayer();
        }
        const questionText = '1234';
        const httpResponses: HttpResponse<boolean>[] = [
            new HttpResponse({ status: HttpStatusCode.BadRequest, body: true }),
            new HttpResponse({ status: HttpStatusCode.BadRequest, body: false }),
            new HttpResponse({ status: HttpStatusCode.Ok, body: true }),
        ];
        communicationServiceSpy.post.and.returnValues(of(httpResponses[0]), of(httpResponses[1]), of(httpResponses[2]));
        service.validatePlayerAnswers(questionText).subscribe(() => {
            expect(service.players[0].isCorrect).toBeFalse();
            expect(service.players[1].isCorrect).toBeFalse();
            expect(service.players[2].isCorrect).toBeTrue();
        });
    });

    it('removePlayer should remove the player from the list', () => {
        const player = service.createPlayer();
        const nPlayers = service.players.length;
        service.removePlayer(player.name);
        expect(service.players.length).toBe(nPlayers - 1);
        expect(service.players).not.toContain(player);
    });
});

