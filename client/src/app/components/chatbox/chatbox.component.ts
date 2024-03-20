import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat.service';
import { PlayerService } from '@app/services/player.service';
@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit, OnDestroy {
    showChat = false;
    newMessage = '';
    // private messagesSubscription: Subscription;

    constructor(
        public chatService: ChatService,
        public publicService: PlayerService,
        private cdRef: ChangeDetectorRef,
    ) {}

    get participantName() {
        return this.chatService.participantName;
    }

    ngOnInit() {
        // this.messagesSubscription = this.chatService.messagesSubjectGetter.subscribe(() => {
        //     this.handleMessagesUpdate();
        // });
        this.chatService.init();
    }

    ngOnDestroy() {
        // this.messagesSubscription.unsubscribe();
    }

    toggleChat() {
        this.showChat = !this.showChat;
    }

    sendMessage() {
        this.chatService.sendMessage(this.newMessage);
        this.newMessage = '';
    }

    handleMessagesUpdate() {
        this.cdRef.detectChanges();
    }
}
