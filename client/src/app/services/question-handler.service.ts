import { Injectable } from '@angular/core';
import { QuestionData } from '@common/question-data';

const GOOD_ANSWER_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService {
    private questionData: QuestionData[];
    private nbQuestions: number;
    private currentQuestionIndex: number = 0;

    get currentQuestion(): QuestionData {
        return this.questionData[this.currentQuestionIndex];
    }
    get nQuestions(): number {
        return this.nbQuestions;
    }

    setQuestions(data: QuestionData[]): void {
        this.questionData = data;
        this.nbQuestions = data.length;
    }

    nextQuestion(): void {
        this.currentQuestionIndex++;
    }

    isAnswerCorrect(isChecked: boolean[]): boolean {
        if (!this.currentQuestion.isMCQ) {
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

    calculateScore(isChecked: boolean[]): number {
        const score = this.currentQuestion.points * GOOD_ANSWER_MULTIPLIER;

        return this.isAnswerCorrect(isChecked) ? score : 0;
    }
}
