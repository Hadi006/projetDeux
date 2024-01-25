import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { GameChoicePageComponent } from '@app/pages/game-choice-page/game-choice-page.component';
=======
import { ChoixJeuComponent } from '@app/choix-jeu/choix-jeu.component';
>>>>>>> a94627a53aecd21dcb791fd7aaa933cf07329a8d
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { QuestionsPageComponent } from '@app/pages/questions-page/questions-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
<<<<<<< HEAD
    { path: 'game', component: GameChoicePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'questions/:jeu', component: QuestionsPageComponent },
=======
    { path: 'game', component: ChoixJeuComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'questions/:jeu', component: QuestionsComponent },
>>>>>>> a94627a53aecd21dcb791fd7aaa933cf07329a8d
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
