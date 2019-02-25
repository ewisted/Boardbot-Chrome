import { TestBed } from '@angular/core/testing';

import { GoogleStorageService } from './google-storage.service';

describe('GoogleStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleStorageService = TestBed.get(GoogleStorageService);
    expect(service).toBeTruthy();
  });
});
