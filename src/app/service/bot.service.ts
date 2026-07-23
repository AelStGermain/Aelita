import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { processBotQuery, ChatMessage } from '../home/bot-engine';

export type WinampSkin = 'classic' | 'basecamp' | 'matrix' | 'gold';

@Injectable({
  providedIn: 'root'
})
export class BotService {
  isOpen = false;
  currentSkin: WinampSkin = 'classic';
  message = '';
  conversation: ChatMessage[] = [
    { who: 'bot', text: '¡Hola! Soy AEL_BOT 1.2 (Winamp Edition) 🤖' },
    { who: 'bot', text: 'Conversa conmigo sobre la experiencia, stack y proyectos de Sofía (Ael). ¡Prueba mis distintas Winamp Skins!' }
  ];

  readonly skins: { id: WinampSkin; name: string; icon: string }[] = [
    { id: 'classic', name: 'Winamp Classic', icon: '⚡' },
    { id: 'basecamp', name: 'Pink Y2K', icon: '💖' },
    { id: 'matrix', name: 'Cyber Matrix', icon: '📟' },
    { id: 'gold', name: 'Retro Gold', icon: '👑' }
  ];

  constructor(private router: Router) {}

  openBot() {
    this.isOpen = true;
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.winamp-bot-input')?.focus();
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

  setSkin(skin: WinampSkin) {
    this.currentSkin = skin;
    localStorage.setItem('ael_bot_skin', skin);
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
      const box = document.querySelector('.winamp-bot-log');
      if (box) box.scrollTop = box.scrollHeight;
    }, 50);
  }
}
