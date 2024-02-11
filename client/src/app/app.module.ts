import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { AlertComponent } from './components/alert/alert.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { DescriptionPanelComponent } from './components/description-panel/description-panel.component';
import { GameTimersComponent } from './components/game-timers/game-timers.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { QuestionItemComponent } from './components/question-item/question-item.component';
import { QuestionComponent } from './components/question/question.component';
import { GameplayPlayerPageComponent } from './pages/gameplay-player-page/gameplay-player-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        LobbyOrganizerPageComponent,
        GameCountDownComponent,
        GameChoicePageComponent,
        DescriptionPanelComponent,
        QuestionComponent,
        GameplayPlayerPageComponent,
        GameTimersComponent,
        ChatboxComponent,
        AlertComponent,
        HomePageComponent,
        QuestionBankComponent,
        QuestionItemComponent,
        QuestionFormComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, DragDropModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
