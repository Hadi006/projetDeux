import { Component } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = true;
    messages: ChatMessage[] = [];
    newMessage = '';

    sendMessage() {
        if (this.newMessage.trim() === '') {
            return;
        }
        const newMessage: ChatMessage = {
            text: this.newMessage,
            timestamp: new Date(),
        };
        this.messages.push(newMessage);
        this.newMessage = '';
    }
}
