import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PetState =
  | 'idle'
  | 'walking'
  | 'happy'
  | 'eating'
  | 'sleeping'
  | 'coding';

@Component({
  selector: 'app-neko',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neko.component.html',
  styleUrls: ['./neko.component.css']
})
export class NekoComponent implements OnInit, OnDestroy {
  @Input() mouseX = 0;
  @Input() mouseY = 0;

  petName = 'AEL_PET';
  petState: PetState = 'idle';
  petHappiness = 90;
  petEnergy = 85;
  petExp = 0;
  petStatusMsg = '';
  isPetBusy = false;
  isMinimized = false;

  readonly petSpriteSheet = 'assets/pet/aelita-cat-spritesheet.png';

  readonly petAltTexts: Record<PetState, string> = {
    idle: 'Aelita espera tranquilamente',
    walking: 'Aelita camina',
    happy: 'Aelita recibe mimos',
    eating: 'Aelita come un pescado',
    sleeping: 'Aelita duerme',
    coding: 'Aelita programa en su notebook'
  };

  private actionTimer?: ReturnType<typeof setTimeout>;
  private readonly petStorageKey = 'aelita_pet_state_v2';

  get petSpriteClass(): string {
    return `pet-${this.petState}`;
  }

  get currentPetAltText(): string {
    return this.petAltTexts[this.petState];
  }

  get petLevel(): number {
    return Math.floor(this.petExp / 50) + 1;
  }

  ngOnInit(): void {
    this.preloadSpriteSheet();
    this.loadPetState();
    if (!this.petStatusMsg) {
      this.petStatusMsg = this.getIdleMessage();
    }
  }

  ngOnDestroy(): void {
    if (this.actionTimer) {
      clearTimeout(this.actionTimer);
    }
  }

  feedPet(): void {
    if (this.isPetBusy) return;

    this.playPetAction(
      'eating',
      '¡Pescadito procesado correctamente!',
      3000,
      () => {
        this.petEnergy = this.clampMeter(this.petEnergy + 12);
        this.petHappiness = this.clampMeter(this.petHappiness + 4);
        this.petExp += 5;
      }
    );
  }

  petPet(): void {
    if (this.isPetBusy) return;

    this.playPetAction(
      'happy',
      'Aelita intenta parecer seria, pero le gustó.',
      2800,
      () => {
        this.petHappiness = this.clampMeter(this.petHappiness + 10);
        this.petExp += 3;
      }
    );
  }

  walkPet(): void {
    if (this.isPetBusy) return;

    if (this.petEnergy < 10) {
      this.petStatusMsg = 'Batería insuficiente. Aelita necesita dormir.';
      return;
    }

    this.playPetAction(
      'walking',
      'Aelita está patrullando el portafolio.',
      3400,
      () => {
        this.petEnergy = this.clampMeter(this.petEnergy - 10);
        this.petHappiness = this.clampMeter(this.petHappiness + 8);
        this.petExp += 6;
      }
    );
  }

  codePet(): void {
    if (this.isPetBusy) return;

    if (this.petEnergy < 15) {
      this.petStatusMsg = 'ERROR_LOW_ENERGY: primero una siesta.';
      return;
    }

    this.playPetAction(
      'coding',
      'Compilando croquetas…',
      4000,
      () => {
        this.petEnergy = this.clampMeter(this.petEnergy - 15);
        this.petHappiness = this.clampMeter(this.petHappiness + 3);
        this.petExp += 12;
      }
    );
  }

  sleepPet(): void {
    if (this.isPetBusy) return;

    this.playPetAction(
      'sleeping',
      'Entrando en modo suspensión…',
      5000,
      () => {
        this.petEnergy = this.clampMeter(this.petEnergy + 25);
        this.petExp += 2;
        this.petStatusMsg = 'Sistema restaurado. Energía recuperada.';
      }
    );
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  private playPetAction(
    state: PetState,
    message: string,
    duration: number,
    onComplete?: () => void
  ): void {
    if (this.actionTimer) {
      clearTimeout(this.actionTimer);
    }

    this.petState = state;
    this.petStatusMsg = message;
    this.isPetBusy = true;

    this.actionTimer = setTimeout(() => {
      onComplete?.();

      this.petState = 'idle';
      this.petStatusMsg = this.getIdleMessage();
      this.isPetBusy = false;

      this.savePetState();
    }, duration);
  }

  private clampMeter(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  private getIdleMessage(): string {
    const messages = [
      'Aelita está observando el sistema.',
      'Esperando una nueva instrucción…',
      'Todos los sistemas parecen estables.',
      'Aelita analiza silenciosamente el portafolio.',
      'No está durmiendo. Está procesando.'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  private preloadSpriteSheet(): void {
    if (typeof Image === 'undefined') {
      return;
    }

    const image = new Image();
    image.src = this.petSpriteSheet;
  }

  private loadPetState(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const raw = localStorage.getItem(this.petStorageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.petHappiness === 'number' && !isNaN(data.petHappiness)) {
          this.petHappiness = this.clampMeter(data.petHappiness);
        }
        if (typeof data.petEnergy === 'number' && !isNaN(data.petEnergy)) {
          this.petEnergy = this.clampMeter(data.petEnergy);
        }
        if (typeof data.petExp === 'number' && !isNaN(data.petExp)) {
          this.petExp = Math.max(0, data.petExp);
        }
        if (typeof data.petName === 'string' && data.petName.trim()) {
          this.petName = data.petName.trim();
        }
      }
    } catch {
      this.petHappiness = 90;
      this.petEnergy = 85;
      this.petExp = 0;
      this.petName = 'AEL_PET';
    }
  }

  private savePetState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = {
        petName: this.petName,
        petHappiness: this.petHappiness,
        petEnergy: this.petEnergy,
        petExp: this.petExp
      };
      localStorage.setItem(this.petStorageKey, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}
