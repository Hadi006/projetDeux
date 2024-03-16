import { Component } from '@angular/core';

@Component({
    selector: 'app-select-name-page',
    templateUrl: './select-name-page.component.html',
    styleUrls: ['./select-name-page.component.scss'],
})
export class SelectNamePageComponent {
    username: string;

    submitUsername() {
        // You can perform any necessary actions with the submitted username here,
        // such as sending it to a server, storing it locally, etc.
        console.log('Submitted username:', this.username);
    }
}
