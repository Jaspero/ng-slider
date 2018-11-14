import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSliderComponent } from './ng-slider.component';

describe('NgSliderComponent', () => {
  let component: NgSliderComponent;
  let fixture: ComponentFixture<NgSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
