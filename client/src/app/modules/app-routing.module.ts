import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'game', component: GameChoicePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'lobby', component: LobbyOrganizerPageComponent },
    { path: 'play', component: GameplayPlayerPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
