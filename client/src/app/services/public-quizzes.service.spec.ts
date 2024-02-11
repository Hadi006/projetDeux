import { TestBed } from '@angular/core/testing';

import { PublicQuizzesService } from './public-quizzes.service';

describe('PublicQuizzesService', () => {
  let service: PublicQuizzesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicQuizzesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
