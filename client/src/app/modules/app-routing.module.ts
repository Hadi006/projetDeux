import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';
import { AdminLoginPageComponent } from '@app/pages/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateQuizPageComponent } from '@app/pages/create-quiz-page/create-quiz-page.component';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinRoomPageComponent } from '@app/pages/join-room-page/join-room-page.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';
import { WaitingRoomPlayerPageComponent } from '@app/pages/waiting-room-player-page/waiting-room-player-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home/join-game', component: JoinRoomPageComponent },
    { path: 'home', component: HomePageComponent },
    { path: 'home/create-game', component: GameChoicePageComponent },
    { path: 'home/join-game', component: JoinRoomPageComponent },
    { path: 'home/admin/login', component: AdminLoginPageComponent },
    { path: 'home/admin/quizzes', component: AdminPageComponent, canActivate: [authGuard] },
    { path: 'home/admin/quizzes/quiz', component: CreateQuizPageComponent, canActivate: [authGuard] },
    { path: 'game', component: GameChoicePageComponent },
    { path: 'waiting-room-host', component: WaitingRoomHostPageComponent },
    { path: 'waiting-room-player', component: WaitingRoomPlayerPageComponent },
    { path: 'test', component: TestPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
