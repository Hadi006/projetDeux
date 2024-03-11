import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';
import { AdminLoginPageComponent } from '@app/pages/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateQuizPageComponent } from '@app/pages/create-quiz-page/create-quiz-page.component';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { OrganizerViewPageComponent } from '@app/pages/organizer-view-page/organizer-view-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'home/create-game', component: GameChoicePageComponent },
    { path: 'home/admin/login', component: AdminLoginPageComponent },
    { path: 'home/admin/quizzes', component: AdminPageComponent, canActivate: [authGuard] },
    { path: 'home/admin/quizzes/quiz', component: CreateQuizPageComponent, canActivate: [authGuard] },
    { path: 'game', component: GameChoicePageComponent },
    { path: 'lobby', component: LobbyOrganizerPageComponent },
    { path: 'play', component: GameplayPlayerPageComponent },
    { path: 'organizer', component: OrganizerViewPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
