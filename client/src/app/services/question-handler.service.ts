import { Injectable, OnDestroy } from '@angular/core';
import { GOOD_ANSWER_MULTIPLIER, GameState } from '@common/constant';
import { QuestionData } from '@common/question-data';
import { Subscription } from 'rxjs';
import { GameStateService } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import { PlayerHandlerService } from './player-handler.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService implements OnDestroy {
    private internalQuestionsData: QuestionData[];
    private currentQuestionIndex = 0;
    private internalNQuestions: number = 0;
    private timerEndedSubscription: Subscription;

    constructor(
        private playerHandlerService: PlayerHandlerService,
        private gameTimersService: GameTimersService,
        private gameStateService: GameStateService,
    ) {
        this.subscribeToTimerEnded();
    }

    get currentQuestion(): QuestionData | undefined {
        return this.internalQuestionsData[this.currentQuestionIndex];
    }
    get nQuestions(): number {
        return this.internalNQuestions;
    }

    set questionsData(data: QuestionData[]) {
        this.internalQuestionsData = data;
        this.internalNQuestions = data.length;
    }

    resetAnswers(): void {
        const nAnswers = this.currentQuestion?.answers.length || 0;
        this.playerHandlerService.resetPlayerAnswers(nAnswers);
    }

    nextQuestion(): void {
        this.currentQuestionIndex++;
        this.resetAnswers();
    }

    updateScores(): void {
        this.playerHandlerService.players.forEach((player) => {
            player.score += this.calculateScore(player.answer);
        });
    }

    calculateScore(isChecked: boolean[]): number {
        if (!this.currentQuestion) {
            return 0;
        }

        const score = this.currentQuestion.points * GOOD_ANSWER_MULTIPLIER;

        return this.isAnswerCorrect(isChecked) ? score : 0;
    }

    isAnswerCorrect(isChecked: boolean[]): boolean {
        if (!this.currentQuestion?.isMCQ) {
            return true;
        }

        const answers = this.currentQuestion.answers;
        const correctAnswers = this.currentQuestion.correctAnswers;

        const allCheckedAreCorrect = isChecked.every((checked, index) => {
            return !checked || (checked && correctAnswers.includes(answers[index]));
        });

        const allCorrectAreChecked = correctAnswers.every((correctAnswer) => {
            return isChecked[answers.indexOf(correctAnswer)];
        });

        return allCheckedAreCorrect && allCorrectAreChecked;
    }

    ngOnDestroy(): void {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameTimersService.timerEndedSubject.subscribe(() => {
            if (this.gameStateService.gameState === GameState.ShowQuestion) {
                this.updateScores();
            }
        });
    }
}
