import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Service } from 'typedi';

@Service()
export class LobbySocketsService {}
