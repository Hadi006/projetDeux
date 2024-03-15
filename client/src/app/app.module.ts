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
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';
import { AlertComponent } from './components/alert/alert.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { DescriptionPanelComponent } from './components/description-panel/description-panel.component';
import { CreateQuizPageComponent } from './pages/create-quiz-page/create-quiz-page.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { QuestionItemComponent } from './components/question-item/question-item.component';
import { QuestionComponent } from './components/question/question.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { AdminLoginPageComponent } from './pages/admin-login-page/admin-login-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { QuizItemComponent } from './components/quiz-item/quiz-item.component';
import { PromptComponent } from './components/prompt/prompt.component';
import { JoinRoomPageComponent } from './pages/join-room-page/join-room-page.component';
import { WaitingRoomInfoComponent } from './components/waiting-room-info/waiting-room-info.component';
import { WaitingRoomPlayerPageComponent } from './pages/waiting-room-player-page/waiting-room-player-page.component';
import { PlayerGamePageComponent } from './pages/player-game-page/player-game-page.component';
import { HostGamePageComponent } from './pages/host-game-page/host-game-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GameCountDownComponent,
        GameChoicePageComponent,
        DescriptionPanelComponent,
        QuestionComponent,
        TestPageComponent,
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
        WaitingRoomHostPageComponent,
        JoinRoomPageComponent,
        WaitingRoomInfoComponent,
        WaitingRoomPlayerPageComponent,
        PlayerGamePageComponent,
        HostGamePageComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
