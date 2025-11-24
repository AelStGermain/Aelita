import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtfComponent } from './ctf.component';

describe('CtfComponent', () => {
  let component: CtfComponent;
  let fixture: ComponentFixture<CtfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
