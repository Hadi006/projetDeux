import { Component } from '@angular/core';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = true;
    messages: { text: string; timestamp: Date }[] = [];
    newMessage = '';

    sendMessage() {
        if (this.newMessage.trim() === '') {
            return;
        }
        const newMessage = {
            text: this.newMessage,
            timestamp: new Date(),
        };
        this.messages.push(newMessage);
        this.newMessage = '';
    }
}
