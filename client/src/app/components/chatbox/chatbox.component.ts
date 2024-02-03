import { Component } from '@angular/core';
import { ChatService, MAX_MESSAGE_LENGTH } from '@app/services/chat.service';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = true;
    newMessage = '';

    constructor(public chatService: ChatService) {}

    sendMessage() {
        const isValidMessage = this.newMessage.trim() !== '' && this.newMessage.length <= MAX_MESSAGE_LENGTH;
        if (!isValidMessage) {
            return;
        }

        const newMessage: ChatMessage = {
            text: this.newMessage,
            timestamp: new Date(),
        };
        this.chatService.messages.push(newMessage);
        this.newMessage = '';
    }
}
