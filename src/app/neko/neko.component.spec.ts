import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NekoComponent } from './neko.component';

describe('NekoComponent (Aelita Pet Tamagotchi)', () => {
  let component: NekoComponent;
  let fixture: ComponentFixture<NekoComponent>;

  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('aelita_pet_state_v2');
    }
    await TestBed.configureTestingModule({
      imports: [NekoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NekoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('aelita_pet_state_v2');
    }
  });

  it('1. El estado inicial es idle', () => {
    expect(component.petState).toBe('idle');
  });

  it('2. La clase inicial es pet-idle', () => {
    expect(component.petSpriteClass).toBe('pet-idle');
  });

  it('3. Cada acción asigna el estado correcto', () => {
    component.feedPet();
    expect(component.petState).toBe('eating');
    component.ngOnDestroy();

    component.isPetBusy = false;
    component.petPet();
    expect(component.petState).toBe('happy');
    component.ngOnDestroy();

    component.isPetBusy = false;
    component.petEnergy = 50;
    component.walkPet();
    expect(component.petState).toBe('walking');
    component.ngOnDestroy();

    component.isPetBusy = false;
    component.petEnergy = 50;
    component.codePet();
    expect(component.petState).toBe('coding');
    component.ngOnDestroy();

    component.isPetBusy = false;
    component.sleepPet();
    expect(component.petState).toBe('sleeping');
    component.ngOnDestroy();
  });

  it('4. Al terminar una acción vuelve a idle', fakeAsync(() => {
    component.feedPet();
    expect(component.petState).toBe('eating');
    tick(3050);
    expect(component.petState).toBe('idle');
    expect(component.isPetBusy).toBeFalse();
  }));

  it('5. El nivel comienza en 1', () => {
    component.petExp = 0;
    expect(component.petLevel).toBe(1);
    component.petExp = 49;
    expect(component.petLevel).toBe(1);
    component.petExp = 50;
    expect(component.petLevel).toBe(2);
  });

  it('6. Los medidores nunca salen del rango 0-100', fakeAsync(() => {
    component.petHappiness = 98;
    component.petEnergy = 98;

    component.petPet();
    tick(3000);
    expect(component.petHappiness).toBe(100);

    component.petEnergy = 5;
    component.petExp = 0;
    component.walkPet();
    expect(component.petEnergy).toBe(5);
  }));

  it('7. Pasear no funciona sin energía suficiente (< 10)', () => {
    component.petEnergy = 5;
    component.walkPet();
    expect(component.petState).toBe('idle');
    expect(component.petStatusMsg).toContain('Batería insuficiente');
  });

  it('8. Programar no funciona sin energía suficiente (< 15)', () => {
    component.petEnergy = 12;
    component.codePet();
    expect(component.petState).toBe('idle');
    expect(component.petStatusMsg).toContain('ERROR_LOW_ENERGY');
  });

  it('9. Dormir recupera energía', fakeAsync(() => {
    component.petEnergy = 30;
    component.sleepPet();
    expect(component.petState).toBe('sleeping');
    tick(5050);
    expect(component.petEnergy).toBe(55);
    expect(component.petState).toBe('idle');
  }));

  it('10. La persistencia soporta datos corruptos', () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'aelita_pet_state_v2',
        JSON.stringify({
          petHappiness: 'invalid',
          petEnergy: null,
          petExp: 'abc'
        })
      );
    }

    const newFixture = TestBed.createComponent(NekoComponent);
    const newComp = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComp.petHappiness).toBe(90);
    expect(newComp.petEnergy).toBe(85);
    expect(newComp.petExp).toBe(0);
    expect(newComp.petState).toBe('idle');
  });

  it('11. ngOnDestroy() elimina el timer pendiente', fakeAsync(() => {
    component.feedPet();
    expect(component.isPetBusy).toBeTrue();
    component.ngOnDestroy();
    tick(3050);
    expect(component.isPetBusy).toBeTrue();
  }));
});
