import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoriceComponent } from './memorice.component';

describe('MemoriceComponent', () => {
  let component: MemoriceComponent;
  let fixture: ComponentFixture<MemoriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
