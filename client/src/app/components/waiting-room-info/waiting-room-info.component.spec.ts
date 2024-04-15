import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';

import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { WaitingRoomInfoComponent } from './waiting-room-info.component';

describe('WaitingRoomInfoComponent', () => {
    let component: WaitingRoomInfoComponent;
    let fixture: ComponentFixture<WaitingRoomInfoComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['handleSockets']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomInfoComponent],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a confirmation dialog and navigate to home if confirmed', () => {
        const dialogRef = { afterClosed: () => of(true) };
        (dialogSpy.open as jasmine.Spy).and.returnValue(dialogRef);
        component.openConfirmationDialog();
        expect(dialogSpy.open).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should open a confirmation dialog and not navigate to home if not confirmed', () => {
        const dialogRef = { afterClosed: () => of(false) };
        (dialogSpy.open as jasmine.Spy).and.returnValue(dialogRef);
        component.openConfirmationDialog();
        expect(dialogSpy.open).toHaveBeenCalled();
    });
});
