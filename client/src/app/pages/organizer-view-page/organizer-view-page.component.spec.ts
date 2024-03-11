import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PLAYERS_TEST } from '@common/constant';
import { QUIZ_TEST_1 } from '@common/quiz-test';
import { OrganizerViewPageComponent } from './organizer-view-page.component';

describe('OrganizerViewPageComponent', () => {
    let component: OrganizerViewPageComponent;
    let fixture: ComponentFixture<OrganizerViewPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OrganizerViewPageComponent],
        });
        fixture = TestBed.createComponent(OrganizerViewPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should move player to next question', () => {
        component.currentQuestionIndex = 0; // Assuming currentQuestionIndex starts from 0
        component.movePlayerToNextQuestion();
        expect(component.currentQuestionIndex).toBe(1); // Assuming currentQuestionIndex increments by 1
    });

    it('should update player score', () => {
        const player1 = PLAYERS_TEST[0];
        const player2 = PLAYERS_TEST[1];
        player1.score = 0;
        player2.score = 0;
        component.playerList = [player1, player2];
        component.gameData = QUIZ_TEST_1; // Provide a sample quiz data

        // Assuming the first player has a correct answer for the first question in QUIZ_TEST_1
        component.updatePlayerScore();

        // Assuming QUIZ_TEST_1.questions[0].points is the score for the first question
        expect(component.playerList[0].score).toBe(QUIZ_TEST_1.questions[0].points);
        expect(component.playerList[1].score).toBe(0); // Assuming player 2 did not answer the question
    });
});
