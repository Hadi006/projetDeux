import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { Subject } from 'rxjs';
import { ChatboxComponent } from './chatbox.component';

describe('ChatboxComponent', () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage']);

        const messagesSubject = new Subject<void>();

        Object.defineProperty(chatServiceSpy, 'messagesSubjectGetter', { value: messagesSubject });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ChatboxComponent],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle showChat when toggleChat is called', () => {
        component.showChat = false;
        component.toggleChat();
        expect(component.showChat).toBe(true);
        component.toggleChat();
        expect(component.showChat).toBe(false);
    });

    it('should call chatService.sendMessage when sendMessage is called', () => {
        component.sendMessage();
        expect(chatServiceSpy.sendMessage).toHaveBeenCalled();
    });

    it('should return participant name from chat service', () => {
        expect(component.participantName).toBe(chatServiceSpy.participantName);
    });

    it('should reset newMessage to an empty string after sendMessage is called', () => {
        component.newMessage = 'test message';
        component.sendMessage();
        expect(component.newMessage).toBe('');
    });

    it('should call sendMessage when Enter key is pressed', () => {
        const sendMessageSpy = spyOn(component, 'sendMessage');

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.keyEnter(event);

        expect(sendMessageSpy).toHaveBeenCalled();
    });
});
