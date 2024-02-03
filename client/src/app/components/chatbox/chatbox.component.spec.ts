import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from './chatbox.component';
import { ChatService } from '@app/services/chat.service';

describe('ChatComponent', () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage']);
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

    it('should add a new message to the messages array', () => {
        const initialMessageCount = component.messages.length;

        component.newMessage = 'Test message';
        component.sendMessage();

        expect(component.messages.length).toBe(initialMessageCount + 1);
    });

    it('should not add a new message to the messages array if the message is empty', () => {
        const initialMessageCount = component.messages.length;

        component.newMessage = '';
        component.sendMessage();

        expect(component.messages.length).toBe(initialMessageCount);
    });

    it('should not add a new message to the messages array if the message is too long', () => {
        const initialMessageCount = component.messages.length;

        component.newMessage = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);
        component.sendMessage();

        expect(component.messages.length).toBe(initialMessageCount);
    });

    it('should not add a new message to the messages array if the message is only whitespace', () => {
        const initialMessageCount = component.messages.length;

        component.newMessage = '    ';
        component.sendMessage();

        expect(component.messages.length).toBe(initialMessageCount);
    });
});
