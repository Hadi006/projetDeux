import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
    selector: 'app-waiting-room-info',
    templateUrl: './waiting-room-info.component.html',
    styleUrls: ['./waiting-room-info.component.scss'],
})
export class WaitingRoomInfoComponent implements OnInit {
    @Input() title: string;
    @Input() pin: string;
    @Input() nPlayers: number;

    constructor(
        private chatService: ChatService,
        private dialog: MatDialog,
        private router: Router,
    ) {}

    ngOnInit() {
        this.chatService.handleSockets();
    }

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: 'Êtes-vous sûr de vouloir quitter cette partie?',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate(['/home']);
            }
        });
    }
}
