import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: Socket;

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    onEvent<T>(event: string, action: (data: T) => void) {
        this.socket.on(event, action);
    }

    emit<T>(event: string, data?: T, callback?: (data: unknown) => void) {
        this.socket.emit(event, data, callback);
    }
}
