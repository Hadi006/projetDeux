import { Component } from '@angular/core';
import { ChatService  } from '@app/services/chat.service';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = true;
    newMessage = '';

    constructor(public chatService: ChatService) {}
}
