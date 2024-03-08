import { ChangeDetectorRef, Component } from '@angular/core';
import { ChatService } from '@app/services/chat.service';

// import * as io from 'socket.io-client';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = false;
    newMessage = '';
    // message: string = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // socket: any;
    messages: string[] = [];
    // messages: ChatMessage[] = [];

    constructor(
        public chatService: ChatService,
        private cdRef: ChangeDetectorRef, // private socketService: SocketService,
    ) {}

    // ngOnInit() {
    //     this.chatService.getMessages().subscribe((message: string) => {
    //         this.messages.push(message);
    //     });
    // }

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
