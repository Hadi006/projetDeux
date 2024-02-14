import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginPageComponent } from '@app/pages/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateQuizPageComponent } from '@app/pages/create-quiz-page/create-quiz-page.component';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'home/create-game', component: GameChoicePageComponent },
    { path: 'home/admin/login', component: AdminLoginPageComponent },
    { path: 'home/admin/quizzes', component: AdminPageComponent },
    { path: 'home/admin/quizzes/quiz', component: CreateQuizPageComponent },
    { path: 'game', component: GameChoicePageComponent },
    { path: 'lobby', component: LobbyOrganizerPageComponent },
    { path: 'play', component: GameplayPlayerPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
