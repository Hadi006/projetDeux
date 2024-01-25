import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { QuestionsPageComponent } from '@app/pages/questions-page/questions-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GameChoicePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'questions/:jeu', component: QuestionsPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}