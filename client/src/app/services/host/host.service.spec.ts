/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';
import { HostService } from '@app/services/host/host.service';
import { TimeService } from '@app/services/time/time.service';
import { QCM_TIME_FOR_PANIC, QRL_TIME_FOR_PANIC, TEST_GAME_DATA, TEST_PLAYERS, TEST_QUESTIONS, TEST_QUIZZES } from '@common/constant';
import { Game } from '@common/game';
import { Player } from '@common/player';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { ReplaySubject, Subject, firstValueFrom, of } from 'rxjs';
import { PlayerUpdatedEventData } from '@common/player-updated-event-data';
import { Question, Quiz } from '@common/quiz';

describe('HostService', () => {
    let service: HostService;
    let hostSocketServiceSpy: jasmine.SpyObj<HostSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;
    let testGame: Game;
    let testQuizzes: Quiz[];
    let testQuestions: Question[];
    const playerJoinedSubject: Subject<Player> = new Subject();
    const playerLeftSubject: Subject<PlayerLeftEventData> = new Subject();
    const confirmPlayerAnswerSubject: Subject<void> = new Subject();
    const playerUpdatedSubject: Subject<PlayerUpdatedEventData> = new Subject();
    const newHostSubject: Subject<Game> = new Subject();

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', [
            'createTimerById',
            'stopTimerById',
            'startTimerById',
            'setTimeById',
            'getTimeById',
            'startPanicMode',
            'stopPanicMode',
            'toggleTimerById',
        ]);
        timeServiceSpy.createTimerById.and.returnValue(1);

        hostSocketServiceSpy = jasmine.createSpyObj('HostSocketService', [
            'isConnected',
            'connect',
            'disconnect',
            'onPlayerJoined',
            'onPlayerLeft',
            'onConfirmPlayerAnswer',
            'onPlayerUpdated',
            'onNewHost',
            'emitCreateGame',
            'emitRequestGame',
            'emitToggleLock',
            'emitKick',
            'emitMute',
            'emitStartGame',
            'emitNextQuestion',
            'emitUpdatePlayers',
            'emitEndGame',
            'emitEndQuestion',
            'emitUpdateScores',
            'emitAnswer',
            'emitPauseTimer',
            'emitPanicMode',
        ]);
        hostSocketServiceSpy.onPlayerJoined.and.returnValue(playerJoinedSubject);
        hostSocketServiceSpy.onPlayerLeft.and.returnValue(playerLeftSubject);
        hostSocketServiceSpy.onConfirmPlayerAnswer.and.returnValue(confirmPlayerAnswerSubject);
        hostSocketServiceSpy.onPlayerUpdated.and.returnValue(playerUpdatedSubject);
        hostSocketServiceSpy.onNewHost.and.returnValue(newHostSubject);
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        hostSocketServiceSpy.emitCreateGame.and.returnValue(of(testGame));
        testQuizzes = JSON.parse(JSON.stringify(TEST_QUIZZES));
        testQuestions = JSON.parse(JSON.stringify(TEST_QUESTIONS));

        eventSubject = new ReplaySubject();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HostSocketService, useValue: hostSocketServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(HostService);
        await firstValueFrom(service.createGame(testQuizzes[0]));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("should verify if the route uses sockets and clean up if it doesn't", () => {
        Object.defineProperty(routerSpy, 'routerState', {
            get: () => ({
                snapshot: { root: { firstChild: { data: { usesSockets: false } } } },
            }),
        });
        spyOn(service, 'cleanUp');
        eventSubject.next(new NavigationEnd(1, 'url', 'url'));
        expect(service.cleanUp).toHaveBeenCalled();
    });

    it('should connect the socket if it isnt connected', () => {
        hostSocketServiceSpy.isConnected.and.returnValue(false);
        service.handleSockets();
        expect(hostSocketServiceSpy.connect).toHaveBeenCalled();
    });

    it('should add player when player joined', () => {
        service.handleSockets();
        const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerJoinedSubject.next(player);
        expect(service.game?.players).toContain(player);
    });

    it('should remove player when player left', () => {
        service.handleSockets();
        const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerLeftSubject.next({ player, players: [] });
        expect(service.game?.players).not.toContain(player);
        expect(service.quitters).toContain(player);
    });

    it('should not remove player when player left', () => {
        service['reset']();
        service.handleSockets();
        const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerLeftSubject.next({ player, players: [player] });
        expect(service.quitters).not.toContain(player);
    });

    it('should increment nAnswered when player answer is confirmed', () => {
        service.handleSockets();
        confirmPlayerAnswerSubject.next();
        expect(service.nAnswered).toBe(1);
    });

    it('should reset nAnswered when everyone has answered', () => {
        service.handleSockets();
        confirmPlayerAnswerSubject.next();
        confirmPlayerAnswerSubject.next();
        expect(timeServiceSpy.setTimeById).toHaveBeenCalled();
        expect(service.nAnswered).toBe(0);
    });

    it('should not increment nAnswered', () => {
        service['reset']();
        service.handleSockets();
        confirmPlayerAnswerSubject.next();
        expect(service.nAnswered).toBe(0);
    });

    it('should update histograms when player is updated', () => {
        service.handleSockets();
        const histogram = JSON.parse(JSON.stringify(testGame.histograms[0]));
        service.histograms.push(testGame.histograms[1]);
        playerUpdatedSubject.next({ player: testGame.players[0], histogramData: histogram });
        expect(service.histograms).toContain(histogram);
    });

    it('should not update player if game is undefined', () => {
        service['reset']();
        service.handleSockets();
        const histogram = JSON.parse(JSON.stringify(testGame.histograms[0]));
        playerUpdatedSubject.next({ player: testGame.players[0], histogramData: histogram });
        expect(service.histograms).not.toContain(histogram);
    });

    it('should update game when new host is selected', () => {
        service.handleSockets();
        newHostSubject.next(testGame);
        expect(service.game).toEqual(testGame);
    });

    it('should create game', (done) => {
        service['reset']();
        service.createGame(testQuizzes[0]).subscribe((result) => {
            expect(result).toBe(true);
            expect(service.game).toEqual(JSON.parse(JSON.stringify(testGame)));
            done();
        });
    });

    it('should not create game', (done) => {
        service['reset']();
        hostSocketServiceSpy.emitCreateGame.and.returnValue(of(undefined));
        service.createGame(testQuizzes[0]).subscribe((result) => {
            expect(result).toBe(false);
            expect(service.game).toBeNull();
            done();
        });
    });

    it('should request game', (done) => {
        hostSocketServiceSpy.emitRequestGame.and.returnValue(of(JSON.parse(JSON.stringify(testGame))));
        service.requestGame('1234').subscribe(() => {
            expect(service.game).toEqual(JSON.parse(JSON.stringify(testGame)));
            done();
        });
    });

    it('should lock game', () => {
        service.toggleLock();
        expect(service.game?.locked).toBe(true);

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitToggleLock).toHaveBeenCalledWith(service.game.pin, service.game.locked);
    });

    it('should not lock game', () => {
        service['reset']();
        service.toggleLock();
        expect(hostSocketServiceSpy.emitToggleLock).not.toHaveBeenCalled();
    });

    it('should kick player', () => {
        service.kick('Player 1');

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitKick).toHaveBeenCalledWith(service.game.pin, 'Player 1');
    });

    it('should not kick player', () => {
        service['reset']();
        service.kick('Player 1');
        expect(hostSocketServiceSpy.emitKick).not.toHaveBeenCalled();
    });

    it('should mute player', () => {
        const player = JSON.parse(JSON.stringify(testGame.players[0]));
        service.mute(player.name);
        player.muted = true;

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitMute).toHaveBeenCalledWith(service.game.pin, player);
    });

    it('should not mute player if game is undefined', () => {
        service['reset']();
        service.mute('Player 1');
        expect(hostSocketServiceSpy.emitMute).not.toHaveBeenCalled();
    });

    it('should not mute player if player is undefined', () => {
        service.mute('');
        expect(hostSocketServiceSpy.emitMute).not.toHaveBeenCalled();
    });

    it('should start game', () => {
        const countdown = 10;
        service.startGame(countdown);

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitStartGame).toHaveBeenCalledWith(service.game.pin, countdown);
    });

    it('should not start game', () => {
        service['reset']();
        service.startGame(1);
        expect(hostSocketServiceSpy.emitStartGame).not.toHaveBeenCalled();
    });

    it('should emit next question', () => {
        const question = JSON.parse(JSON.stringify(testQuizzes[0].questions[0]));
        question.choices[1].isCorrect = true;
        spyOn(service, 'getCurrentQuestion').and.returnValue(question);
        const histogramLength = service.histograms.length;
        service.nextQuestion();

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitNextQuestion).toHaveBeenCalled();
        expect(service.histograms.length).toBe(histogramLength + 1);
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalled();
        expect(timeServiceSpy.startTimerById).toHaveBeenCalled();
    });

    it('should not emit next question', () => {
        service['reset']();
        service.nextQuestion();
        expect(hostSocketServiceSpy.emitNextQuestion).not.toHaveBeenCalled();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalled();
        expect(timeServiceSpy.startTimerById).toHaveBeenCalled();
    });

    it('should emit next question with histogram for non-QCM question', () => {
        const question = JSON.parse(JSON.stringify(testQuizzes[0].questions[0]));
        question.type = 'QRL'; // Simulate a non-QCM question
        spyOn(service, 'getCurrentQuestion').and.returnValue(question);
        const histogramLength = service.histograms.length;

        service.nextQuestion();

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitNextQuestion).toHaveBeenCalled();
        const expectedHistogram = {
            labels: ['Joueurs actifs', 'Joueurs inactifs'],
            datasets: [
                {
                    label: question.text,
                    data: [0, service.game.players.length],
                },
            ],
        };
        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitNextQuestion).toHaveBeenCalledWith(service.game.pin, {
            question,
            countdown: service.game.quiz.duration,
            histogram: expectedHistogram,
        });

        expect(service.histograms.length).toBe(histogramLength + 1);

        expect(timeServiceSpy.stopTimerById).toHaveBeenCalled();
        expect(timeServiceSpy.startTimerById).toHaveBeenCalled();
    });

    it('should update players', () => {
        service.updatePlayers();
        expect(hostSocketServiceSpy.emitUpdatePlayers).toHaveBeenCalled();
    });

    it('should not update players', () => {
        service['reset']();
        service.updatePlayers();
        expect(hostSocketServiceSpy.emitUpdatePlayers).not.toHaveBeenCalled();
    });

    it('should end game', () => {
        hostSocketServiceSpy.emitEndGame.and.returnValue(of(JSON.parse(JSON.stringify(TEST_GAME_DATA))));
        service.endGame();
        expect(hostSocketServiceSpy.emitEndGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/endgame'], { state: { game: JSON.parse(JSON.stringify(TEST_GAME_DATA)) } });
    });

    it('should not end game', () => {
        service['reset']();
        spyOn(service, 'cleanUp');
        service.endGame();
        expect(hostSocketServiceSpy.emitEndGame).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        expect(service.cleanUp).not.toHaveBeenCalled();
    });

    it('should clean up', () => {
        service.cleanUp();
        expect(hostSocketServiceSpy.disconnect).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalled();
        expect(service.game).toBeNull();
        expect(service.nAnswered).toBe(0);
        expect(service.questionEnded).toBe(false);
        expect(service.quitters).toEqual([]);
        expect(service.histograms).toEqual([]);
    });

    it('canActivatePanicMode should return true if current question type is QCM and time is >= 5', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(service, 'getTime').and.returnValue(QCM_TIME_FOR_PANIC);

        expect(service.canActivatePanicMode()).toBeTrue();
    });

    it('canActivatePanicMode should return true if current question type is QRL and time is >= 20', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[1]);
        spyOn(service, 'getTime').and.returnValue(QRL_TIME_FOR_PANIC);

        expect(service.canActivatePanicMode()).toBeTrue();
    });

    it('canActivatePanicMode should return false if current question type is not QCM or QRL', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(service, 'getTime').and.returnValue(3);

        expect(service.canActivatePanicMode()).toBeFalse();
    });

    it('canActivatePanicMode should return false if time is less than 5 for QCM', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(testQuestions[0]);
        spyOn(service, 'getTime').and.returnValue(QCM_TIME_FOR_PANIC - 1);

        expect(service.canActivatePanicMode()).toBeFalse();
    });

    it('canActivatePanicMode should return false if time is less than 20 for QRL', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(testQuestions[1]);
        spyOn(service, 'getTime').and.returnValue(QRL_TIME_FOR_PANIC - 1);

        expect(service.canActivatePanicMode()).toBeFalse();
    });

    it('should set up next question', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(testQuizzes[0].questions[1]);
        service['setupNextQuestion']();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalled();
        expect(timeServiceSpy.startTimerById).toHaveBeenCalled();
    });

    it('should not set up next question if there is no game', () => {
        service['reset']();
        service['setupNextQuestion']();
        expect(timeServiceSpy.stopTimerById).not.toHaveBeenCalled();
        expect(timeServiceSpy.startTimerById).not.toHaveBeenCalled();
    });

    it('should not set up next question if there is no current question', (done) => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(undefined);
        service.gameEndedSubject.subscribe(() => {
            expect(timeServiceSpy.stopTimerById).not.toHaveBeenCalled();
            expect(timeServiceSpy.startTimerById).not.toHaveBeenCalled();
            done();
        });
        service['setupNextQuestion']();
    });

    it('should end question', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(testQuizzes[0].questions[0]);
        hostSocketServiceSpy.emitUpdateScores.and.returnValue(of(testGame));
        service.togglePanic();
        service['endQuestion']();
        expect(hostSocketServiceSpy.emitEndQuestion).toHaveBeenCalled();
        expect(hostSocketServiceSpy.emitUpdateScores).toHaveBeenCalled();
        expect(service.game).toEqual(testGame);
        expect(hostSocketServiceSpy.emitAnswer).toHaveBeenCalled();
        expect(timeServiceSpy.stopPanicMode).toHaveBeenCalled();
        expect(service.questionEnded).toBe(true);
    });

    it('should not end question', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(undefined);
        service['endQuestion']();
        expect(hostSocketServiceSpy.emitEndQuestion).not.toHaveBeenCalled();
        expect(hostSocketServiceSpy.emitUpdateScores).not.toHaveBeenCalled();
        expect(hostSocketServiceSpy.emitAnswer).not.toHaveBeenCalled();
        expect(service.questionEnded).toBe(false);
    });

    it('should not end question if qrl and not in test mode', () => {
        testQuizzes[0].questions[0].type = 'QRL';
        testGame.players = [testGame.players[0]];
        spyOn(service, 'getCurrentQuestion').and.returnValue(testQuizzes[0].questions[0]);
        service['endQuestion']();
        expect(hostSocketServiceSpy.emitEndQuestion).toHaveBeenCalled();
        expect(hostSocketServiceSpy.emitUpdateScores).not.toHaveBeenCalled();
        expect(hostSocketServiceSpy.emitAnswer).not.toHaveBeenCalled();
        expect(service.questionEnded).toBe(true);
    });

    it('getTimer should return time', () => {
        const time = 10;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(service.getTime()).toBe(time);
    });

    it('should get current question', () => {
        expect(service.getCurrentQuestion()).toEqual(JSON.parse(JSON.stringify(testQuizzes[0].questions[0])));
    });

    it('should check connection', () => {
        hostSocketServiceSpy.isConnected.and.returnValue(true);
        expect(service.isConnected()).toBe(true);
    });
    it('should emit pauseTimer with game pin if internalGame exists', () => {
        service.pauseTimer();
        expect(hostSocketServiceSpy.emitPauseTimer).toHaveBeenCalledWith(testGame.pin);
    });

    it('should not emit pauseTimer if internalGame is null', () => {
        service['reset']();
        service.pauseTimer();
        expect(hostSocketServiceSpy.emitPauseTimer).not.toHaveBeenCalled();
    });

    it('should emit startPanicMode with game pin if internalGame exists', () => {
        spyOn(service, 'canActivatePanicMode').and.returnValue(true);
        service.startPanicMode();
        expect(hostSocketServiceSpy.emitPanicMode).toHaveBeenCalledWith(testGame.pin);
    });

    it('should not emit startPanicMode if internalGame is null', () => {
        spyOn(service, 'canActivatePanicMode').and.returnValue(true);
        service['reset']();
        service.startPanicMode();
        expect(hostSocketServiceSpy.emitPanicMode).not.toHaveBeenCalled();
    });
    it('should set isPanicMode to false and call timeService.stopPanicMode', () => {
        service.stopPanicMode();

        expect(service.isPanic).toBeFalse();
        expect(timeServiceSpy.stopPanicMode).toHaveBeenCalled();
    });
});
