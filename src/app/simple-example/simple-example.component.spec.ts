import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleExampleComponent } from './simple-example.component';

describe('SimpleExampleComponent', () => {
  let component: SimpleExampleComponent;
  let fixture: ComponentFixture<SimpleExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
