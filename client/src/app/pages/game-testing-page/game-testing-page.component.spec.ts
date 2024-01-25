import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TimeService } from '@app/services/time.service';
import { GameTestingPageComponent } from './game-testing-page.component';

describe('GameTestingPageComponent', () => {
    let component: GameTestingPageComponent;
    let fixture: ComponentFixture<GameTestingPageComponent>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    const TIME_OUT = 10;
    const SHOW_ANSWER_DELAY = 3;
    const QUESTION_TIMER_INDEX = 0;
    const ANSWER_TIMER_INDEX = 1;
    const QUESTION_DATA = [
        {
            id: 0,
            points: 1,
            question: 'Quel est le résultat de 1 + 1 ?',
            answers: ['1', '2', '3', '4'],
            correctAnswers: ['2'],
            isMCQ: true,
        },
        {
            id: 1,
            points: 4,
            question: 'Question réponse libre',
            answers: [],
            correctAnswers: [],
            isMCQ: false,
        },
        {
            id: 2,
            points: 2,
            question: 'Quel est le résultat de 2 + 2 ?',
            answers: ['1', '2', '3', '4'],
            correctAnswers: ['4'],
            isMCQ: true,
        },
    ];

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'getTime', 'startTimer', 'stopTimer']);
        let timerIdSequence = 0;
        timeServiceSpy.createTimer.and.callFake(() => timerIdSequence++);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameTestingPageComponent],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTestingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('time should call timeService.getTime with the correct timerId if showingAnswer is false and returns the correct time', () => {
        component['timerIds'] = [0, 1];
        component['showingAnswer'] = false;
        timeServiceSpy.getTime.and.returnValue(TIME_OUT);

        expect(component.time).toEqual(TIME_OUT);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(QUESTION_TIMER_INDEX);
    });

    it('time should call timeService.getTime with the correct timerId if showingAnswer is true and returns the correct time', () => {
        component['timerIds'] = [0, 1];
        component['showingAnswer'] = true;
        timeServiceSpy.getTime.and.returnValue(TIME_OUT);

        expect(component.time).toEqual(TIME_OUT);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(ANSWER_TIMER_INDEX);
    });

    it('handleKeyUp should set answerConfirmed to true if the key is Enter', () => {
        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        component.handleKeyUp(event);

        expect(component.answerConfirmed).toEqual(true);
    });

    it('handleKeyUp should not set answerConfirmed to true if the key is not Enter', () => {
        const event = new KeyboardEvent('keyup', { key: 'A' });
        component.handleKeyUp(event);

        expect(component.answerConfirmed).toEqual(false);
    });

    it('ngOnInit should create two timers and assign the correct timerIds', () => {
        expect(timeServiceSpy.createTimer).toHaveBeenCalledTimes(2);
        expect(component['timerIds']).toEqual([0, 1]);
    });

    it('ngOnInit should call getGameData and resetGameState', () => {
        spyOn(component, 'getGameData');
        spyOn(component, 'resetGameState');

        component.ngOnInit();

        expect(component.getGameData).toHaveBeenCalled();
        expect(component.resetGameState).toHaveBeenCalled();
    });

    it('getGameData should set gameData to the correct value', () => {
        // TODO : Replace with a mock server call
        const testGame = {
            id: 0,
            name: 'Math',
            questions: QUESTION_DATA,
            timePerQuestion: 10,
        };

        component.getGameData();

        expect(component.gameData).toEqual(testGame);
    });

    it('resetGameState should navigate to the correct route if the currentQuestionIndex is greater than or equal to the number of questions', () => {
        component['currentQuestionIndex'] = 3;
        spyOn(component['router'], 'navigate');

        component.resetGameState();

        expect(component['router'].navigate).toHaveBeenCalledWith(['']);
    });

    it('resetGameState should set answerConfirmed and showingAnswer to false', () => {
        component['answerConfirmed'] = true;
        component['showingAnswer'] = true;

        component.resetGameState();

        expect(component.answerConfirmed).toEqual(false);
        expect(component.showingAnswer).toEqual(false);
    });

    it('resetGameState should call timeService.startTimer with the correct timerId and timePerQuestion', () => {
        component['timerIds'][ANSWER_TIMER_INDEX] = 1;
        component.gameData = {
            id: 0,
            name: 'Math',
            questions: QUESTION_DATA,
            timePerQuestion: 10,
        };
        component.resetGameState();

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timerIds'][QUESTION_TIMER_INDEX], TIME_OUT);
    });

    it('showAnswer should set answerConfirmed and showingAnswer to true', () => {
        component['answerConfirmed'] = false;
        component['showingAnswer'] = false;

        component.showAnswer();

        expect(component.answerConfirmed).toEqual(true);
        expect(component.showingAnswer).toEqual(true);
    });

    it('showAnswer should call timeService.startTimer with the correct timerId and SHOW_ANSWER_DELAY', () => {
        component['timerIds'][ANSWER_TIMER_INDEX] = 1;
        component.showAnswer();

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timerIds'][ANSWER_TIMER_INDEX], SHOW_ANSWER_DELAY);
    });
});
