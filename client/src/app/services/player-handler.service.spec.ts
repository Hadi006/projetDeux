import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AnswerValidatorService } from './answer-validator.service';
import { PlayerHandlerService } from './player-handler.service';

describe('PlayerHandlerService', () => {
    let service: PlayerHandlerService;
    let answerValidatorServiceSpy: jasmine.SpyObj<AnswerValidatorService>;

    beforeEach(() => {
        answerValidatorServiceSpy = jasmine.createSpyObj('AnswerValidatorService', ['validateAnswer']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{
                provide: AnswerValidatorService,
                useValue: answerValidatorServiceSpy,
            }],
        });
        service = TestBed.inject(PlayerHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createPlayer should create a player and increment nPlayers', () => {
        const nPlayers = service.nPlayers;
        const player = service.createPlayer();
        expect(player).toBeTruthy();
        expect(service.nPlayers).toBe(nPlayers + 1);
        expect(service.players.get(nPlayers)).toEqual(player);
    });

    it('handleKeyUp should confirm the answer if Enter is pressed', () => {
        const player = service.createPlayer();
        spyOn(service, 'confirmPlayerAnswer');
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }), player);
        expect(service.confirmPlayerAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle the answer if a number key is pressed', () => {
        const player = service.createPlayer();
        player.answer = [false, false, false];
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }), player);
        expect(player.answer).toEqual([true, false, false]);
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }), player);
        expect(player.answer).toEqual([false, false, false]);
    });

    it('handleKeyUp should not toggle the answer if a number key is pressed out of range', () => {
        const player = service.createPlayer();
        player.answer = [false, false, false];
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '0' }), player);
        expect(player.answer).toEqual([false, false, false]);
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '4' }), player);
        expect(player.answer).toEqual([false, false, false]);
    });

    it('handleKeyUp should not toggle the answer if a non-number key is pressed', () => {
        const player = service.createPlayer();
        player.answer = [false, false, false];
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'a' }), player);
        expect(player.answer).toEqual([false, false, false]);
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
            service.confirmPlayerAnswer(service.players.get(i));
            expect(service.players.get(i)?.answerConfirmed).toBeTrue();
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
            service.confirmPlayerAnswer(service.players.get(i));
        }
        expect(service.allAnsweredSubject.next).toHaveBeenCalledTimes(1);
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players.get(i));
        }
        expect(service.allAnsweredSubject.next).toHaveBeenCalledTimes(2);
    });

    it('resetPlayerAnswers should reset all players answers and answerConfirmed', () => {
        const nPlayers = 3;
        const nAnswers = 4;
        for (let i = 0; i < nPlayers; i++) {
            const player = service.createPlayer();
            player.answer = new Array(nAnswers).fill(true);
            player.answerConfirmed = true;
        }
        service.resetPlayerAnswers(nAnswers);
        service.players.forEach((player) => {
            expect(player.answer).toEqual(new Array(nAnswers).fill(false));
            expect(player.answerConfirmed).toBeFalse();
        });
    });

    it('validatePlayerAnswers should set isCorrect to true if the answer is correct', (done) => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            const player = service.createPlayer();
            player.answer = [true, false, true];
        }
        const response = new HttpResponse({ status: 200, body: true });
        communicationServiceSpy.post.and.returnValues(of(response), of(response), of(response));
        service.validatePlayerAnswers('').subscribe(() => {
            service.players.forEach((player) => {
                expect(player.isCorrect).toBeTrue();
            });
            done();
        });
    });

    it('validatePlayerAnswers should set isCorrect to false if the response body is null', (done) => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            const player = service.createPlayer();
            player.answer = [true, false, true];
        }
        const response = new HttpResponse({ status: 200, body: null });
        communicationServiceSpy.post.and.returnValues(of(response), of(response), of(response));
        service.validatePlayerAnswers('').subscribe(() => {
            service.players.forEach((player) => {
                expect(player.isCorrect).toBeFalse();
            });
            done();
        });
    });

    it('validatePlayerAnwers should handle the error if the request fails', (done) => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            const player = service.createPlayer();
            player.answer = [true, false, true];
        }
        const response = new HttpResponse({ status: 200, body: true });
        const errorResponse = new HttpResponse({ body: new Error('error') });
        communicationServiceSpy.post.and.returnValues(
            throwError(() => {
                return errorResponse;
            }),
            of(response),
            of(response),
        );
        service.validatePlayerAnswers('').subscribe(() => {
            expect(service.players.get(0)?.isCorrect).toBeFalse();
            expect(service.players.get(1)?.isCorrect).toBeTrue();
            expect(service.players.get(2)?.isCorrect).toBeTrue();
            done();
        });
    });
});
