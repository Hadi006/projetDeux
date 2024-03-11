import { Component, OnInit } from '@angular/core';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { PLAYERS_TEST } from '@common/constant';
import { Player } from '@common/player';
import { Quiz } from '@common/quiz';
import { QUIZ_TEST_1 } from '@common/quiz-test';

@Component({
    selector: 'app-organizer-view-page',
    templateUrl: './organizer-view-page.component.html',
    styleUrls: ['./organizer-view-page.component.scss'],
})
export class OrganizerViewPageComponent implements OnInit {
    gameData: Quiz;
    chatBox: ChatboxComponent;
    allPlayerSubmitted: boolean = true;
    playerList: Player[] = [];
    currentAnswerIndex = 0;
    playerScores = new Map<string, number>();
    currentQuestionIndex = 0;
    showNextQuestionButton: boolean = true;

    get time(): number {
        return 0;
    }

    ngOnInit(): void {
        this.gameData = QUIZ_TEST_1;
        this.playerList = PLAYERS_TEST;
        this.allPlayerSubmitted = this.playerList[0].answerConfirmed && this.playerList[1].answerConfirmed;
    }

    movePlayerToNextQuestion(): void {
        this.currentQuestionIndex++;
    }
}
