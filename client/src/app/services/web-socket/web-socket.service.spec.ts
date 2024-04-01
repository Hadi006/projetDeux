import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { WebSocketService } from './web-socket.service';

describe('WebSocketService', () => {
    let service: WebSocketService;
    let socketSpy: jasmine.SpyObj<Socket>;
    let ioSpy: jasmine.Spy;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['emit', 'disconnect', 'on']);

        ioSpy = jasmine.createSpy('io').and.returnValue(socketSpy);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    beforeEach(() => {
        service = TestBed.inject(WebSocketService);
        service['socket'] = ioSpy(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if the socket is alive', () => {
        socketSpy.connected = true;
        expect(service.isSocketAlive()).toBeTrue();
    });

    it('should disconnect the socket', () => {
        service.disconnect();
        expect(socketSpy.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect the socket if it is not connected', () => {
        service['socket'] = undefined;
        service.disconnect();
        expect(socketSpy.disconnect).not.toHaveBeenCalled();
    });

    it('should call socket.on with an event', () => {
        const event = 'event';
        const action = () => {
            return;
        };
        service.onEvent(event, action);
        expect(socketSpy.on).toHaveBeenCalledWith(event, action);
    });

    it('should call socket.emit with an event', () => {
        const event = 'event';
        const data = 'data';
        const callback = () => {
            return;
        };
        service.emit(event, data, callback);
        expect(socketSpy.emit).toHaveBeenCalledWith(event, data, callback);
    });

    it('should not call socket.emit if the socket is not connected', () => {
        service['socket'] = undefined;
        service.emit('event');
        expect(socketSpy.emit).not.toHaveBeenCalled();
    });
});
