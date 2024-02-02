import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatboxComponent } from './chatbox.component';

describe('ChatComponent', () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatboxComponent],
            imports: [FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatboxComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have an empty messages array initially', () => {
        expect(component.messages.length).toBe(0);
    });

    it('should add a new message to the messages array', () => {
        const initialMessageCount = component.messages.length;

        component.newMessage = 'Test message';
        component.sendMessage();

        expect(component.messages.length).toBe(initialMessageCount + 1);
    });
});
