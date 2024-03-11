import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { Subject, Observable, map } from 'rxjs';
import { NEW_PLAYER } from '@common/constant';
import { CommunicationService } from './communication.service';
import { HttpStatusCode } from '@angular/common/http';
import { Answer, Question } from '@common/quiz';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayer: Player;
    private internalConfirmedSubject: Subject<boolean> = new Subject<boolean>();
    private internalAnsweredSubject: Subject<void> = new Subject<void>();

    constructor(private communicationService: CommunicationService) {}

    get player(): Player {
        return this.internalPlayer;
    }

    get answerConfirmedSubject(): Subject<boolean> {
        return this.internalConfirmedSubject;
    }

    get allAnsweredSubject(): Subject<void> {
        return this.internalAnsweredSubject;
    }

    getPlayerAnswers(): Answer[] {
        return this.internalPlayer.questions[this.internalPlayer.questions.length - 1].choices;
    }

    getPlayerBooleanAnswers(): boolean[] {
        return this.getPlayerAnswers().map((answer) => answer.isCorrect);
    }

    createPlayer(): Player {
        const newPlayer = { ...NEW_PLAYER };
        this.internalPlayer = newPlayer;

        return newPlayer;
    }

    handleKeyUp(event: KeyboardEvent, player: Player): void {
        if (event.key === 'Enter') {
            this.confirmPlayerAnswer(player);
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.getPlayerAnswers().length) {
            this.getPlayerAnswers()[key].isCorrect = !this.getPlayerAnswers()[key].isCorrect;
        }
    }

    confirmPlayerAnswer(player: Player | undefined): void {
        if (!player) {
            return;
        }

        this.internalConfirmedSubject.next(true);
        this.internalAnsweredSubject.next();
    }

    resetPlayerAnswers(question: Question): void {
        const resetQuestion = { ...question };
        resetQuestion.choices = question.choices.map((choice) => ({ ...choice, isCorrect: false }));
        this.internalPlayer.questions.push(resetQuestion);
        this.internalConfirmedSubject.next(false);
        this.internalPlayer.isCorrect = false;
    }

    validatePlayerAnswers(questionText: string, points: number): void {
        this.validateAnswer(questionText, this.getPlayerBooleanAnswers()).subscribe((isCorrect) => {
            this.internalPlayer.isCorrect = isCorrect;
            this.internalPlayer.score += isCorrect ? points : 0;
        });
    }

    private validateAnswer(text: string, answer: boolean[]): Observable<boolean> {
        return this.communicationService.post<boolean>('questions/validate-answer', { answer, text }).pipe(
            map((response) => {
                if (response.status !== HttpStatusCode.Ok) {
                    return false;
                }

                return response.body || false;
            }),
        );
    }
}
