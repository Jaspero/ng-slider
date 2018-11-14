import { TestBed } from '@angular/core/testing';

import { NgSliderService } from './ng-slider.service';

describe('NgSliderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgSliderService = TestBed.get(NgSliderService);
    expect(service).toBeTruthy();
  });
});
