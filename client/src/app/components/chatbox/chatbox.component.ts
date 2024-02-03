import { Component } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ChatService, MAX_MESSAGE_LENGTH } from '@app/services/chat.service';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = true;
    messages: ChatMessage[] = [];
    newMessage = '';

    constructor(private chatService: ChatService) {}

    sendMessage() {
        const isValidMessage = this.newMessage.trim() !== '' && this.newMessage.length <= MAX_MESSAGE_LENGTH;
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
