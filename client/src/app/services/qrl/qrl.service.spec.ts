import { TestBed } from '@angular/core/testing';

import { QrlService } from './qrl.service';

describe('QrlService', () => {
  let service: QrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
