import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { ChatMessage } from '@common/chat-message';
import { Subject } from 'rxjs';
import { ChatboxComponent } from './chatbox.component';

describe('ChatboxComponent', () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let elementRefSpy: jasmine.SpyObj<ElementRef>;
    let element: HTMLElement;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage']);
        Object.defineProperty(chatServiceSpy, 'messages', { get: () => ['test message'], configurable: true });

        const messagesSubject = new Subject<void>();

        Object.defineProperty(chatServiceSpy, 'messagesSubjectGetter', { value: messagesSubject });

        elementRefSpy = {} as jasmine.SpyObj<ElementRef>;
        element = document.createElement('input');
        Object.defineProperty(elementRefSpy, 'nativeElement', { get: () => element, configurable: true });
        const newMessageSubject = new Subject<ChatMessage>();
        Object.defineProperty(chatServiceSpy, 'newMessage$', { get: () => newMessageSubject, configurable: true });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ChatboxComponent],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: ElementRef, useValue: elementRefSpy },
            ],
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

    it('should get messages from chat service', () => {
        expect(component.getMessages()).toEqual(chatServiceSpy.messages);
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

    it('should set chatbox scrollTop to chatbox scrollHeight when new message is received', () => {
        component['chatbox'] = elementRefSpy;
        chatServiceSpy.participantName = 'test author';
        const newMessage: ChatMessage = { author: 'test author', text: 'test message', timestamp: new Date() };
        chatServiceSpy.newMessage$.next(newMessage);
        expect(component['chatbox'].nativeElement.scrollTop).toBe(component['chatbox'].nativeElement.scrollHeight);
    });

    it('should not set chatbox scrollTop to chatbox scrollHeight when new message is received from different author', () => {
        component['chatbox'] = elementRefSpy;
        component['chatbox'].nativeElement.scrollTop = 0;
        chatServiceSpy.participantName = 'test author';
        const newMessage: ChatMessage = { author: 'different author', text: 'test message', timestamp: new Date() };
        chatServiceSpy.newMessage$.next(newMessage);
        expect(component['chatbox'].nativeElement.scrollTop).toBe(0);
    });

    it('should return participant name from chat service', () => {
        expect(component.name).toBe(chatServiceSpy.participantName);
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

    it('isFocused should return false when elementRef does not contain activeElement', () => {
        expect(component.isFocused()).toBe(false);
    });
});
