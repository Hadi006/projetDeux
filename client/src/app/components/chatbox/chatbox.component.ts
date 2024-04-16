import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { ChatMessage } from '@common/chat-message';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit, OnDestroy {
    @Input() pin: string;
    @Input() name: string;
    @ViewChild('chatbox') private chatbox: ElementRef;
    showChat = false;
    newMessage = '';
    private newMessageSubscription: Subscription;

    constructor(
        private chatService: ChatService,
        private elementRef: ElementRef,
        private cdRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        if (!this.chatService.pin) {
            this.chatService.pin = this.pin;
        }

        if (!this.chatService.participantName) {
            this.chatService.participantName = this.name;
        }

        this.newMessageSubscription = this.chatService.newMessage$.subscribe((message: ChatMessage) => {
            if (message && message.author === this.chatService.participantName) {
                this.cdRef.detectChanges();
                this.chatbox.nativeElement.scrollTop = this.chatbox.nativeElement.scrollHeight;
            }
        });
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

    ngOnDestroy() {
        this.newMessageSubscription.unsubscribe();
    }
}
