import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { processBotQuery, ChatMessage } from './bot-engine';

@Component({ selector: 'app-home', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './home.component.html', styleUrls: ['./home.component.css'] })
export class HomeComponent implements OnDestroy {
  botOpen = false; message = '';
  radioOn = false; station = 'dream'; volume = 0.18;
  private audioContext?: AudioContext;
  private radioTimer?: number;
  private noteIndex = 0;
  conversation: ChatMessage[] = [
    { who: 'bot', text: '¡Hola! Soy AEL_BOT 1.0' },
    { who: 'bot', text: 'Puedes preguntarme sobre el perfil de Sofía. No te garantizo que sean respuestas verídicas; mejor hablar con ella en persona.' }
  ];
  constructor(private router: Router) { }

  toggleRadio() { this.radioOn ? this.stopRadio() : this.startRadio(); }
  selectStation(station: string) { this.station = station; if (this.radioOn) { this.stopRadio(); this.startRadio(); } }
  startRadio() {
    this.audioContext ??= new AudioContext();
    this.audioContext.resume(); this.radioOn = true; this.noteIndex = 0;
    this.playRadioNote();
    this.radioTimer = window.setInterval(() => this.playRadioNote(), 720);
  }
  stopRadio() { if (this.radioTimer) window.clearInterval(this.radioTimer); this.radioTimer = undefined; this.radioOn = false; }
  setVolume() { /* volume is applied to each new generative note */ }
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

  @HostListener('document:keydown', ['$event']) shortcut(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) { event.preventDefault(); this.openBot(); }
    if (event.key === 'Escape') this.botOpen = false;
  }
  openBot() { this.botOpen = true; setTimeout(() => document.querySelector<HTMLInputElement>('.bot-input')?.focus()); }
  async ask(suggestion?: string) {
    const raw = (suggestion ?? this.message).trim(); if (!raw) return;
    this.conversation.push({ who: 'you', text: raw }); this.message = '';

    this.conversation.push({ who: 'bot', text: 'Pensando...' });
    this.scrollBotLog();

    const historyForAi = this.conversation.slice(0, -1);
    const result = await processBotQuery(raw, historyForAi);

    if (this.conversation.length > 0 && this.conversation[this.conversation.length - 1].text === 'Pensando...') {
      this.conversation.pop();
    }

    if (result.action === 'clear') {
      this.conversation = [];
      return;
    }
    if (result.answer) {
      this.conversation.push({ who: 'bot', text: result.answer });
    }
    if (result.action === 'navigate_about') {
      setTimeout(() => this.router.navigate(['/about']), 1200);
    }
    this.scrollBotLog();
  }

  private scrollBotLog() {
    setTimeout(() => { const box = document.querySelector('.bot-log'); if (box) box.scrollTop = box.scrollHeight; });
  }
}
