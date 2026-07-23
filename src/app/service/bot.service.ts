import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { processBotQuery, ChatMessage } from '../home/bot-engine';

export type Y2kFrame = 'pink' | 'cyber' | 'gold' | 'sakura';

@Injectable({
  providedIn: 'root'
})
export class BotService {
  isOpen = false;
  currentFrame: Y2kFrame = 'pink';
  message = '';
  conversation: ChatMessage[] = [
    { who: 'bot', text: '¡Hola! Soy AEL_BOT 1.2 🤖' },
    { who: 'bot', text: 'Conversa conmigo sobre los proyectos, stack y trayectoria de Sofía (Ael). ¡Prueba mis marcos Y2K seleccionables!' }
  ];

  readonly frames: { id: Y2kFrame; name: string; icon: string }[] = [
    { id: 'pink', name: 'Holo Pink', icon: '💖' },
    { id: 'cyber', name: 'Cyber Matrix', icon: '📟' },
    { id: 'gold', name: 'Win 98 Gold', icon: '👑' },
    { id: 'sakura', name: 'Sakura Retro', icon: '🌸' }
  ];

  constructor(private router: Router) {
    const savedFrame = localStorage.getItem('ael_bot_frame') as Y2kFrame;
    if (savedFrame && this.frames.some(f => f.id === savedFrame)) {
      this.currentFrame = savedFrame;
    }
  }

  openBot() {
    this.isOpen = true;
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.y2k-bot-input')?.focus();
    }, 100);
  }

  closeBot() {
    this.isOpen = false;
  }

  toggleBot() {
    if (this.isOpen) {
      this.closeBot();
    } else {
      this.openBot();
    }
  }

  setFrame(frame: Y2kFrame) {
    this.currentFrame = frame;
    localStorage.setItem('ael_bot_frame', frame);
  }

  async ask(suggestion?: string) {
    const raw = (suggestion ?? this.message).trim();
    if (!raw) return;
    
    this.conversation.push({ who: 'you', text: raw });
    this.message = '';

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
    setTimeout(() => {
      const box = document.querySelector('.y2k-bot-log');
      if (box) box.scrollTop = box.scrollHeight;
    }, 50);
  }
}
