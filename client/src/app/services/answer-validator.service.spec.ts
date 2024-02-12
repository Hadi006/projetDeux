import { TestBed } from '@angular/core/testing';

import { AnswerValidatorService } from './answer-validator.service';

describe('AnswerValidatorService', () => {
  let service: AnswerValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnswerValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
