import { Injectable } from '@angular/core';
import { ServerData } from '@common/message';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private readonly socketUrl: string = 'ws://localhost:3000';
    private readonly webSocket: WebSocket;

    constructor() {
        this.webSocket = new WebSocket(this.socketUrl);
    }
}
