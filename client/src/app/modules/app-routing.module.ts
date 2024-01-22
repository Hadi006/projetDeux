import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChoixJeuComponent } from '@app/choix-jeu/choix-jeu.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { QuestionsComponent } from '@app/questions/questions.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: ChoixJeuComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'questions/:jeu', component: QuestionsComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
