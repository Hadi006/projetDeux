import { Injectable } from '@angular/core';
import { QuestionData } from '@common/question-data';
import { Subject } from 'rxjs';

export const GOOD_ANSWER_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService {
    private questionData: QuestionData[];
    private currentQuestionIndex: number = 0;
    private internalNQuestions: number;
    private internalQuestionsSubject: Subject<QuestionData | undefined> = new Subject<QuestionData | undefined>();

    get currentQuestion(): QuestionData | undefined {
        return this.questionData[this.currentQuestionIndex];
    }
    get nQuestions(): number | undefined {
        return this.internalNQuestions;
    }

    get questionSubjects(): Subject<QuestionData | undefined> {
        return this.internalQuestionsSubject;
    }

    setQuestions(data: QuestionData[]): void {
        this.questionData = data;
        this.internalNQuestions = data.length;
    }

    nextQuestion(): void {
        this.internalQuestionsSubject.next(this.questionData[this.currentQuestionIndex++]);
    }

    calculateScore(isChecked: boolean[]): number {
        if (!this.currentQuestion) {
            return 0;
        }

        const score = this.currentQuestion.points * GOOD_ANSWER_MULTIPLIER;

        return this.isAnswerCorrect(isChecked) ? score : 0;
    }

    private isAnswerCorrect(isChecked: boolean[]): boolean {
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
