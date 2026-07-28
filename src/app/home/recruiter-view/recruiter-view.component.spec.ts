import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { BotService } from '../../service/bot.service';
import { RecruiterViewComponent } from './recruiter-view.component';

describe('RecruiterViewComponent wheel navigation', () => {
  let component: RecruiterViewComponent;
  let scrollIntoView: jasmine.Spy;

  beforeEach(() => {
    scrollIntoView = jasmine.createSpy('scrollIntoView');
    const host = new ElementRef({
      querySelector: jasmine.createSpy('querySelector').and.returnValue({ scrollIntoView })
    } as unknown as HTMLElement);

    component = new RecruiterViewComponent(host, {} as BotService);
  });

  afterEach(() => component.ngOnDestroy());

  function wheel(deltaY: number): WheelEvent {
    return {
      ctrlKey: false,
      deltaY,
      target: null,
      preventDefault: jasmine.createSpy('preventDefault')
    } as unknown as WheelEvent;
  }

  it('jumps to the next section after a small accumulated wheel gesture', () => {
    component.onWheel(wheel(4));
    component.onWheel(wheel(4));
    expect(component.activeSection).toBe('profile');

    component.onWheel(wheel(4));

    expect(component.activeSection).toBe('projects');
    expect(component.activeSectionPage).toBe(1);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  it('locks repeated wheel events until the section transition finishes', fakeAsync(() => {
    component.onWheel(wheel(100));
    component.onWheel(wheel(100));
    expect(component.activeSection).toBe('projects');

    tick(851);
    component.onWheel(wheel(100));
    expect(component.activeSection).toBe('projects');
    expect(component.activeSectionPage).toBe(2);

    tick(851);
    component.onWheel(wheel(100));
    expect(component.activeSection).toBe('stack');
    expect(component.activeSectionPage).toBe(1);
  }));
});
