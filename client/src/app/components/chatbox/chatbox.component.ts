import { Component } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';

const maxMessageLength = 200;

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
        const isValidMessage = this.newMessage.trim() !== '' && this.newMessage.length <= maxMessageLength;
        if (!isValidMessage) {
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
