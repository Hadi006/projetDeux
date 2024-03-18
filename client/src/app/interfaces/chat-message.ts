import { Player } from '@common/player';

export interface ChatMessage {
    text: string;
    timestamp: Date;
    author: Player;
    roomId: string;
}
