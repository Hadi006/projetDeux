import { Injectable, OnDestroy } from '@angular/core';
import { Answer, Question } from '@common/quiz';
import { Subscription } from 'rxjs';
import { GameStateService, GameState } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import { PlayerHandlerService } from './player-handler.service';

export const GOOD_ANSWER_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService implements OnDestroy {
    private internalQuestions: Question[];
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

    get currentQuestion(): Question | undefined {
        return this.internalQuestions[this.currentQuestionIndex];
    }

    get currentAnswers(): Answer[] {
        return this.currentQuestion?.choices.filter((choice) => choice.isCorrect) || [];
    }

    get nQuestions(): number {
        return this.internalNQuestions;
    }

    set questionsData(data: Question[]) {
        this.internalQuestions = data;
        this.internalNQuestions = data.length;
    }

    resetAnswers(): void {
        const nAnswers = this.currentQuestion?.choices.length || 0;
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
        if (!(this.currentQuestion?.type === 'multiple-choices')) {
            return true;
        }

        const answers = this.currentQuestion.choices;
        const correctAnswers = this.currentQuestion.choices.filter((answer) => answer.isCorrect);

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
