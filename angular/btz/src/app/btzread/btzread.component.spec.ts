import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtzreadComponent } from './btzread.component';

describe('BtzreadComponent', () => {
  let component: BtzreadComponent;
  let fixture: ComponentFixture<BtzreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtzreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtzreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
