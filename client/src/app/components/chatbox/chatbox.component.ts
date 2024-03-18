import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat.service';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit, OnDestroy {
    @Input() playerName: string;

    showChat = false;
    newMessage = '';
    private messagesSubscription: Subscription;

    constructor(
        public chatService: ChatService,
        public publicService: PlayerService,
        private cdRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.messagesSubscription = this.chatService.messagesSubjectGetter.subscribe(() => {
            this.handleMessagesUpdate();
        });
    }

    ngOnDestroy() {
        this.messagesSubscription.unsubscribe();
    }

    toggleChat() {
        this.showChat = !this.showChat;
    }

    sendMessage() {
        this.chatService.sendMessage(this.newMessage, this.publicService.player);
        this.newMessage = '';
    }

    handleMessagesUpdate() {
        this.cdRef.detectChanges();
    }
}
