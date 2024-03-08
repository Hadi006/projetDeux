import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { LobbyService } from '@app/services/lobby.service';
import { Quiz } from '@common/quiz';
import { TEST_LOBBY_DATA } from '@common/constant';

describe('LobbyOrganizerPageComponent', () => {
    const TEST_QUIZ: Quiz = {
        id: '0',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 10,
        lastModification: new Date(),
        questions: [],
    };

    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let lobbyServiceSpy: jasmine.SpyObj<LobbyService>;

    beforeEach(() => {
        lobbyServiceSpy = jasmine.createSpyObj('LobbyService', ['subscribeLobbyToServer']);
        Object.defineProperty(lobbyServiceSpy, 'lobbyData', { value: TEST_LOBBY_DATA });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent, GameCountDownComponent],
            providers: [{ provide: LobbyService, useValue: lobbyServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyOrganizerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('lobbyId should be set lobbyData', () => {
        expect(component.lobbyData).toEqual(TEST_LOBBY_DATA);
        expect(component.lobbyData.quiz).toEqual(TEST_QUIZ);
    });

    it('should call lobbyService.subscribeToLobbyDataById', () => {
        expect(lobbyServiceSpy.subscribeLobbyToServer).toHaveBeenCalled();
    });

    it('should set lobbyData.started to true', () => {
        component.startGame();
        expect(component.lobbyData.started).toBeTrue();
    });
});
