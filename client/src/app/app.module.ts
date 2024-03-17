import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { AlertComponent } from './components/alert/alert.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { DescriptionPanelComponent } from './components/description-panel/description-panel.component';
import { GameTimersComponent } from './components/game-timers/game-timers.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { PromptComponent } from './components/prompt/prompt.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { QuestionItemComponent } from './components/question-item/question-item.component';
import { QuestionComponent } from './components/question/question.component';
import { QuizItemComponent } from './components/quiz-item/quiz-item.component';
import { AdminLoginPageComponent } from './pages/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateQuizPageComponent } from './pages/create-quiz-page/create-quiz-page.component';
import { GameplayPlayerPageComponent } from './pages/gameplay-player-page/gameplay-player-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { OrganizerViewPageComponent } from './pages/organizer-view-page/organizer-view-page.component';
import { ChartModule } from '@syncfusion/ej2-angular-charts';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        LobbyOrganizerPageComponent,
        GameCountDownComponent,
        GameChoicePageComponent,
        DescriptionPanelComponent,
        QuestionComponent,
        GameplayPlayerPageComponent,
        GameTimersComponent,
        ChatboxComponent,
        AdminLoginPageComponent,
        AlertComponent,
        HomePageComponent,
        CreateQuizPageComponent,
        AdminPageComponent,
        QuizItemComponent,
        QuestionBankComponent,
        QuestionItemComponent,
        QuestionFormComponent,
        PromptComponent,
        OrganizerViewPageComponent,
        HistogramComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        DragDropModule,
        ReactiveFormsModule,
        ChartModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
