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

    it('should call chatService.sendMessage when sendMessage is called', () => {
        component.newMessage = 'test message';
        component.sendMessage();
        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith('test message');
    });
});
