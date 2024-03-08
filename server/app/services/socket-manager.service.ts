import * as http from 'http';
import * as io from 'socket.io';

export class SocketService {
    private sio: io.Server;
    // private room: string = 'serverRoom';
    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket: io.Socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            socket.on('new-message', (message) => {
                console.log(message);
                this.sio.emit('message-received', message);
            });
            // message initial
            // socket.emit('hello', 'Hello World!');

            // socket.on('validateWithAck', (word: string, callback) => {
            //     const isValid = word.length > 5;
            //     callback({ isValid });
            // });
            // socket.on('validate', (word: string) => {
            //     const isValid = word.length > 5;
            //     socket.emit('wordValidated', isValid);
            // });

            // socket.on('broadcastAll', (message: string) => {
            //     this.sio.sockets.emit('massMessage', `${socket.id} : ${message}`);
            // });

            // socket.on('joinRoom', () => {
            //     socket.join(this.room);
            // });

            // socket.on('roomMessage', (message: string) => {
            //     // Seulement un membre de la salle peut envoyer un message aux autres
            //     if (socket.rooms.has(this.room)) {
            //         this.sio.to(this.room).emit('roomMessage', `${socket.id} : ${message}`);
            //     }
            // });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
        setInterval(() => {
            this.emitTime();
        }, 1000);
    }
    private emitTime() {
        this.sio.sockets.emit('clock', new Date().toLocaleTimeString());
    }
}
