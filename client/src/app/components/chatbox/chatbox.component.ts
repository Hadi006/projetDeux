import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat.service';
import { Subscription } from 'rxjs';

// import * as io from 'socket.io-client';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit, OnDestroy {
    showChat = false;
    newMessage = '';
    // message: string = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // socket: any;
    messages: string[] = [];
    // messages: ChatMessage[] = [];
    private messagesSubscription: Subscription;

    constructor(
        public chatService: ChatService,
        private cdRef: ChangeDetectorRef, // private socketService: SocketService,, ChangeDetectorRef
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

    // sendMessage() {
    //     this.chatService.sendMessage(this.newMessage);
    //     this.socketService.sendMessage(this.newMessage);
    //     this.newMessage = '';
    // }
    sendMessage() {
        this.chatService.sendMessage(this.newMessage);
        this.newMessage = '';
    }
    handleMessagesUpdate() {
        this.cdRef.detectChanges();
    }
}
