import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BotService } from '../service/bot.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  radioOn = false;
  station = 'dream';
  volume = 0.18;
  private audioContext?: AudioContext;
  private radioTimer?: number;
  private noteIndex = 0;

  constructor(
    private router: Router,
    public botService: BotService
  ) {}

  toggleRadio() { this.radioOn ? this.stopRadio() : this.startRadio(); }
  selectStation(station: string) { this.station = station; if (this.radioOn) { this.stopRadio(); this.startRadio(); } }
  startRadio() {
    this.audioContext ??= new AudioContext();
    this.audioContext.resume(); this.radioOn = true; this.noteIndex = 0;
    this.playRadioNote();
    this.radioTimer = window.setInterval(() => this.playRadioNote(), 720);
  }
  stopRadio() { if (this.radioTimer) window.clearInterval(this.radioTimer); this.radioTimer = undefined; this.radioOn = false; }
  setVolume() { /* volume applied to generative notes */ }
  private playRadioNote() {
    if (!this.audioContext) return;
    const stations: Record<string, { notes: number[], wave: OscillatorType, tempo: number }> = {
      dream: { notes: [220, 277.18, 329.63, 415.3, 329.63, 277.18], wave: 'sine', tempo: 1.8 },
      cosmic: { notes: [146.83, 220, 293.66, 369.99, 293.66, 220], wave: 'triangle', tempo: 2.5 },
      machine: { notes: [110, 164.81, 220, 246.94, 220, 164.81], wave: 'square', tempo: .42 }
    };
    const preset = stations[this.station]; const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator(); const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    osc.type = preset.wave; osc.frequency.value = preset.notes[this.noteIndex++ % preset.notes.length];
    filter.type = 'lowpass'; filter.frequency.value = this.station === 'machine' ? 950 : 1500;
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.001, this.volume * .22), now + .08); gain.gain.exponentialRampToValueAtTime(.0001, now + preset.tempo);
    osc.connect(filter).connect(gain).connect(this.audioContext.destination); osc.start(now); osc.stop(now + preset.tempo + .05);
  }
  ngOnDestroy() { this.stopRadio(); this.audioContext?.close(); }

  openBot() {
    this.botService.openBot();
  }

  openPortfolio() {
    const btn = document.querySelector<HTMLButtonElement>('.drawer-toggle-btn');
    if (btn) btn.click();
  }
}
