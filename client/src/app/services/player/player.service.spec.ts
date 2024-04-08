import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { PlayerService } from '@app/services/player/player.service';
import { TimeService } from '@app/services/time/time.service';
import { PlayerSocketService } from '@app/services/player-socket/player-socket.service';
import { firstValueFrom, of, ReplaySubject, Subject } from 'rxjs';
import { Player } from '@common/player';
import { Answer } from '@common/quiz';
import { Game } from '@common/game';
import { QuestionChangedEventData } from '@common/question-changed-event-data';
import { TEST_ANSWERS, TEST_GAME_DATA, TEST_PLAYERS, TEST_QUESTIONS, TRANSITION_DELAY } from '@common/constant';

describe('PlayerService', () => {
    let player: Player;

    let service: PlayerService;
    let playerSocketServiceSpy: jasmine.SpyObj<PlayerSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;
    const playerJoinedSubject: Subject<string> = new Subject();
    const playerLeftSubject: Subject<Player[]> = new Subject();
    const kickSubject: Subject<string> = new Subject();
    const startGameSubject: Subject<number> = new Subject();
    const endQuestionSubject: Subject<void> = new Subject();
    const questionChangedSubject: Subject<QuestionChangedEventData> = new Subject();
    const newScoreSubject: Subject<Player> = new Subject();
    const answerSubject: Subject<Answer[]> = new Subject();
    const gameEndedSubject: Subject<Game> = new Subject();
    const gameDeletedSubject: Subject<void> = new Subject();

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'startTimerById', 'stopTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);
        playerSocketServiceSpy = jasmine.createSpyObj('PlayerSocketService', [
            'connect',
            'disconnect',
            'isConnected',
            'onPlayerJoined',
            'onPlayerLeft',
            'onKick',
            'onStartGame',
            'onEndQuestion',
            'onQuestionChanged',
            'onNewScore',
            'onAnswer',
            'onGameEnded',
            'onGameDeleted',
            'emitJoinGame',
            'emitUpdatePlayer',
            'emitConfirmPlayerAnswer',
            'emitUpdatePlayer',
        ]);
        playerSocketServiceSpy.onPlayerJoined.and.returnValue(playerJoinedSubject);
        playerSocketServiceSpy.onPlayerLeft.and.returnValue(playerLeftSubject);
        playerSocketServiceSpy.onKick.and.returnValue(kickSubject);
        playerSocketServiceSpy.onStartGame.and.returnValue(startGameSubject);
        playerSocketServiceSpy.onEndQuestion.and.returnValue(endQuestionSubject);
        playerSocketServiceSpy.onQuestionChanged.and.returnValue(questionChangedSubject);
        playerSocketServiceSpy.onNewScore.and.returnValue(newScoreSubject);
        playerSocketServiceSpy.onAnswer.and.returnValue(answerSubject);
        playerSocketServiceSpy.onGameEnded.and.returnValue(gameEndedSubject);
        playerSocketServiceSpy.onGameDeleted.and.returnValue(gameDeletedSubject);
        player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerSocketServiceSpy.emitJoinGame.and.returnValue(
            of({ player, gameTitle: 'title', gameId: TEST_GAME_DATA.quiz.id, otherPlayers: [], error: '' }),
        );

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
            imports: [HttpClientTestingModule],
            providers: [
                { provide: PlayerSocketService, useValue: playerSocketServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(PlayerService);
        await firstValueFrom(service.joinGame('pin', { playerName: 'player', isHost: false }));
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

    it('should connect to the socket if it isnt connected', () => {
        playerSocketServiceSpy.isConnected.and.returnValue(false);
        service.handleSockets();
        expect(playerSocketServiceSpy.connect).toHaveBeenCalled();
    });

    it('should get the player answers', () => {
        if (!service.player) {
            fail();
            return;
        }

        expect(service.getPlayerAnswers()).toEqual(service.player.questions[service.player.questions.length - 1].choices);
    });

    it('should not get the player answers if the player is not in the game', () => {
        service.player = null;
        expect(service.getPlayerAnswers()).toEqual([]);
    });

    it('should get the player boolean answers', () => {
        expect(service.getPlayerBooleanAnswers()).toEqual(service.getPlayerAnswers().map((answer) => answer.isCorrect));
    });

    it('should check if the player is connected', () => {
        playerSocketServiceSpy.isConnected.and.returnValue(true);
        expect(service.isConnected()).toBeTrue();
    });

    it('should add a player to the list when a player joins', (done) => {
        const expectedPlayer = 'player';
        service.handleSockets();
        playerSocketServiceSpy.onPlayerJoined().subscribe((p) => {
            expect(p).toEqual(expectedPlayer);
            done();
        });
        playerJoinedSubject.next(expectedPlayer);
    });

    it('should update the list of players when a player leaves', (done) => {
        const expectedPlayers = JSON.parse(JSON.stringify(TEST_PLAYERS));
        service.handleSockets();
        playerSocketServiceSpy.onPlayerLeft().subscribe((players) => {
            expect(players).toEqual(expectedPlayers);
            expect(service.players).toEqual(expectedPlayers.map((p: Player) => p.name));
            done();
        });
        playerLeftSubject.next(expectedPlayers);
    });

    it('should navigate to the home page if the player is kicked', () => {
        service.player = { name: 'player' } as Player;
        service.handleSockets();
        kickSubject.next('player');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should do nothing if the player is not in the game', () => {
        service.player = null;
        service.handleSockets();
        kickSubject.next('player');
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should start the game when the host starts it', (done) => {
        service.handleSockets();
        const time = 10;
        startGameSubject.subscribe(() => {
            expect(service.gameStarted).toBeTrue();
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, time);
            done();
        });
        startGameSubject.next(time);
    });

    it('should end the question when the host ends it', () => {
        service.handleSockets();
        endQuestionSubject.subscribe(() => {
            expect(service.answerConfirmed).toBeTrue();
            expect(timeServiceSpy.setTimeById).toHaveBeenCalledWith(1, 0);
        });
        endQuestionSubject.next();
    });

    it('should update the question when the host changes it', () => {
        service.handleSockets();
        const time = 10;
        const data = { question: JSON.parse(JSON.stringify(TEST_QUESTIONS[0])), countdown: time };
        questionChangedSubject.subscribe((eventData) => {
            expect(eventData).toEqual(data);
            expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, TRANSITION_DELAY, jasmine.any(Function));
        });
        questionChangedSubject.next(data);
    });

    it('should update the score when the host sends a new score', (done) => {
        service.handleSockets();
        const newScoreSubscription = newScoreSubject.subscribe((p) => {
            expect(p).toEqual(player);
            done();
            newScoreSubscription.unsubscribe();
        });
        player.score++;
        newScoreSubject.next(player);
    });

    it('should not update the score if the player is not in the game', () => {
        service.player = null;
        service.handleSockets();
        player.score++;
        newScoreSubject.next(player);
        expect(service.player).toBeNull();
    });

    it('should do nothing if the player is not in the game', () => {
        service.player = null;
        service.handleSockets();
        answerSubject.next([]);
        expect(service.answer).toEqual([]);
    });

    it('should update the answer when the host sends it', () => {
        service.handleSockets();
        const answer = JSON.parse(JSON.stringify(TEST_ANSWERS));
        answerSubject.next(answer);
        expect(service.answer).toEqual(answer);
    });

    it('should end the game when the host ends it', (done) => {
        service.handleSockets();
        spyOn(service, 'cleanUp');
        const game = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        gameEndedSubject.subscribe((g) => {
            expect(g).toEqual(game);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/endgame'], { state: { game } });
            expect(service.cleanUp).toHaveBeenCalled();
            expect(service.gameEnded).toBeTrue();
            done();
        });
        gameEndedSubject.next(game);
    });

    it('should leave the game when the host deletes it', () => {
        service.handleSockets();
        spyOn(service, 'cleanUp');
        gameDeletedSubject.next();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should join the game if there is no error', (done) => {
        service.joinGame('pin', { playerName: 'player', isHost: false }).subscribe((result) => {
            expect(result).toEqual('');
            expect(service.player).toEqual(JSON.parse(JSON.stringify(TEST_PLAYERS[0])));
            expect(service.players).toEqual([]);
            expect(service.gameTitle).toEqual('title');
            expect(service.gameId).toEqual(TEST_GAME_DATA.quiz.id);
            expect(service.pin).toEqual('pin');
            done();
        });
    });

    it('should update the player', () => {
        service.updatePlayer();

        if (!service.player) {
            fail();
            return;
        }

        expect(playerSocketServiceSpy.emitUpdatePlayer).toHaveBeenCalledWith('pin', player);
    });

    it('should not update the player if the player is not in the game', () => {
        service.player = null;
        service.updatePlayer();
        expect(playerSocketServiceSpy.emitUpdatePlayer).not.toHaveBeenCalled();
    });

    it('should handle key up events', () => {
        service.handleKeyUp({ key: 'Enter' } as KeyboardEvent);
        expect(playerSocketServiceSpy.emitConfirmPlayerAnswer).toHaveBeenCalled();

        service.handleKeyUp({ key: '1' } as KeyboardEvent);
        expect(service.getPlayerAnswers()[0].isCorrect).toBeTrue();
    });

    it('should confirm the player answer', () => {
        service.confirmPlayerAnswer();
        expect(playerSocketServiceSpy.emitConfirmPlayerAnswer).toHaveBeenCalledWith('pin', player);
        expect(service.answerConfirmed).toBeTrue();
    });

    it('should not confirm the player answer if the player is not in the game', () => {
        service.player = null;
        service.confirmPlayerAnswer();
        expect(playerSocketServiceSpy.emitConfirmPlayerAnswer).not.toHaveBeenCalled();
    });

    it('should get the time', () => {
        const time = 10;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(service.getTime()).toEqual(time);
    });

    it('should clean up', () => {
        service.cleanUp();
        expect(playerSocketServiceSpy.disconnect).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalled();
        expect(service.player).toBeNull();
        expect(service.pin).toEqual('');
        expect(service.gameTitle).toEqual('');
        expect(service.players).toEqual([]);
        expect(service.gameStarted).toBeFalse();
        expect(service.gameEnded).toBeFalse();
        expect(service.answerConfirmed).toBeFalse();
        expect(service.answer).toEqual([]);
        expect(service.isCorrect).toBeFalse();
    });

    it('should set up next question', () => {
        const time = 10;
        service['setupNextQuestion'](TEST_QUESTIONS[0], time);
        expect(service.player?.questions[0]).toEqual(JSON.parse(JSON.stringify(TEST_QUESTIONS[0])));
        expect(service.answerConfirmed).toBeFalse();
        expect(service.answer).toEqual([]);
        expect(service.isCorrect).toBeFalse();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, time);
    });

    it('should not set up next question if the player is not in the game', () => {
        service.player = null;
        const time = 10;
        service['setupNextQuestion'](TEST_QUESTIONS[0], time);
        expect(timeServiceSpy.stopTimerById).not.toHaveBeenCalled();
        expect(timeServiceSpy.startTimerById).not.toHaveBeenCalled();
    });
});
