import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@app/services/chat.service';

import { WaitingRoomInfoComponent } from './waiting-room-info.component';

describe('WaitingRoomInfoComponent', () => {
    let component: WaitingRoomInfoComponent;
    let fixture: ComponentFixture<WaitingRoomInfoComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['init']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomInfoComponent],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(chatServiceSpy.init).toHaveBeenCalled();
    });
});
