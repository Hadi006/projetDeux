import { ChangeDetectorRef, Component } from '@angular/core';
import { ChatService } from '@app/services/chat.service';
import { PlayerService } from '@app/services/player.service';
@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent {
    showChat = false;
    newMessage = '';

    constructor(
        public chatService: ChatService,
        public publicService: PlayerService,
        private cdRef: ChangeDetectorRef,
    ) {}

    get participantName() {
        return this.chatService.participantName;
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
