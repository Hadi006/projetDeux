import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit {
    @Input() pin: string;
    @Input() name: string;
    showChat = false;
    newMessage = '';

    constructor(
        private chatService: ChatService,
        private elementRef: ElementRef,
    ) {}

    ngOnInit() {
        if (!this.chatService.pin) {
            this.chatService.pin = this.pin;
        }

        if (!this.chatService.participantName) {
            this.chatService.participantName = this.name;
        }
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

    isFocused() {
        return this.elementRef.nativeElement.contains(document.activeElement);
    }
}
