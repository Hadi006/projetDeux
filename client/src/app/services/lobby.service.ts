// import { Inject, Injectable } from '@angular/core';
// // import { SocketService } from '@app/services/socket.service';
// // import { LobbyData } from '@common/lobby-data';

// @Injectable({
//     providedIn: 'root',
// })
// export class LobbyService {
//     constructor(@Inject(SocketService) private readonly socketService: SocketService) {}

//     subscribeLobbyToServer(lobbyData: LobbyData) {
//         this.socketService.filteredDataByType<LobbyData>('lobbyData').subscribe((data) => {
//             if (lobbyData.id === data.id) {
//                 delete lobbyData.quiz;
//                 Object.assign(lobbyData, data);
//             }
//         });
//     }
// }
