import { TestBed } from '@angular/core/testing';

import { ZillowService } from './zillow.service';

describe('ZillowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZillowService = TestBed.get(ZillowService);
    expect(service).toBeTruthy();
  });
});
