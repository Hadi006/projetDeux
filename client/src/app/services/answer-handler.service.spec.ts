import { TestBed } from '@angular/core/testing';

import { AnswerHandlerService } from './answer-handler.service';

describe('AnswerHandlerService', () => {
  let service: AnswerHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnswerHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
