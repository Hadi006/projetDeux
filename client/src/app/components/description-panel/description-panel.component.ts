import { Component, Input } from '@angular/core';
import { Quiz } from '@common/quiz';

@Component({
    selector: 'app-description-panel',
    templateUrl: './description-panel.component.html',
    styleUrls: ['./description-panel.component.scss'],
})
export class DescriptionPanelComponent {
    @Input() selectedQuiz: Quiz | null = null;
}
