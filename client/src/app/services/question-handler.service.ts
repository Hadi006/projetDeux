import { Injectable } from '@angular/core';
import { QuestionData } from '@common/question-data';
import { PlayerHandlerService } from './player-handler.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService {
    private internalQuestionsData: QuestionData[];
    private currentQuestionIndex = 0;
    private internalNQuestions: number;

    constructor(private playerHandlerService: PlayerHandlerService) {}

    get currentQuestion(): QuestionData | undefined {
        return this.internalQuestionsData[this.currentQuestionIndex];
    }
    get nQuestions(): number | undefined {
        return this.internalNQuestions;
    }

    set questionsData(data: QuestionData[]) {
        this.internalQuestionsData = data;
        this.internalNQuestions = data.length;
    }

    resetPlayerAnswers(): void {
        this.playerHandlerService.players.forEach((player) => {
            player.answer = new Array(this.currentQuestion?.answers.length).fill(false);
            player.answerConfirmed = false;
        });
    }

    nextQuestion(): void {
        this.currentQuestionIndex++;
        this.resetPlayerAnswers();
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
}
