import { TestBed } from '@angular/core/testing';

import { AdminQuizzesService } from './admin-quizzes.service';

describe('AdminQuizzesService', () => {
  let service: AdminQuizzesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminQuizzesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
