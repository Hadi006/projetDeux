import { Component } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = false;
    newMessage = '';

    constructor(private chatService: ChatService) {}

    get participantName() {
        return this.chatService.participantName;
    }

    getMessages() {
        return this.chatService.messages;
    }

    toggleChat() {
        this.showChat = !this.showChat;
    }

    sendMessage() {
        this.chatService.sendMessage(this.newMessage);
        this.newMessage = '';
    }
    keyEnter(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }
}
