import { TestBed } from '@angular/core/testing';

import { TimeService } from './time.service';

describe('TimeServiceService', () => {
  let service: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
