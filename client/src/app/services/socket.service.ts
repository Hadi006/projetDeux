import { Injectable } from '@angular/core';
import { ServerData } from '@common/server-data';
import { Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private readonly socketUrl: string = 'ws://localhost:3000';
    private webSocket: WebSocketSubject<ServerData>;

    constructor() {
        this.webSocket = new WebSocketSubject(this.socketUrl);
    }

    filteredDataByType<T>(type: string): Observable<T> {
        return this.webSocket.pipe(
            filter((message) => message.type === type),
            map((message) => JSON.parse(message.data) as T),
        );
    }
}
