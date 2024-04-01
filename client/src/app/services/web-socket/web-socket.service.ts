import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: Socket | undefined;

    isSocketAlive(): boolean {
        return !!this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        if (!this.socket) {
            return;
        }

        this.socket.disconnect();
    }

    onEvent<T>(event: string, action: (data: T) => void) {
        if (!this.socket) {
            return;
        }

        this.socket.on(event, action);
    }

    emit<T>(event: string, data?: T, callback?: (data: unknown) => void) {
        if (!this.socket) {
            return;
        }

        this.socket.emit(event, data, callback);
    }
}
