import { TestBed } from '@angular/core/testing';

import { InputServiceService } from './input-service.service';

describe('InputServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InputServiceService = TestBed.get(InputServiceService);
    expect(service).toBeTruthy();
  });
});
