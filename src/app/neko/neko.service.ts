import { Injectable } from '@angular/core';

export type NekoState = 'CODING' | 'EVOLVING' | 'DEPLOYING' | 'IDLE' | 'OFFLINE MODE';

@Injectable({
  providedIn: 'root'
})
export class NekoService {
  exp: number = 0;
  currentState: NekoState = 'IDLE';
  lastActivityDesc: string = '';

  constructor() {
    this.loadExp();
    this.fetchGithubState();
  }

  private loadExp() {
    const saved = localStorage.getItem('ael_neko_exp');
    if (saved) {
      this.exp = parseInt(saved, 10);
    }
  }

  public saveExp() {
    localStorage.setItem('ael_neko_exp', this.exp.toString());
  }

  public addExp(amount: number) {
    this.exp += amount;
    this.saveExp();
  }

  public async fetchGithubState() {
    const cacheKey = 'ael_neko_github_cache';
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      const now = new Date().getTime();
      // Cache for 30 minutes (1800000 ms)
      if (now - parsed.timestamp < 1800000) {
        this.currentState = parsed.state;
        this.lastActivityDesc = parsed.desc;
        return;
      }
    }

    try {
      const response = await fetch('https://api.github.com/users/AelStGermain/events/public');
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      if (data && data.length > 0) {
        const latestEvent = data[0];
        const repoName = latestEvent.repo.name;

        switch (latestEvent.type) {
          case 'PushEvent':
            this.currentState = 'CODING';
            this.lastActivityDesc = `Aelita estuvo trabajando recientemente en ${repoName}.`;
            break;
          case 'CreateEvent':
            this.currentState = 'EVOLVING';
            this.lastActivityDesc = `Aelita creó un nuevo proyecto: ${repoName}.`;
            break;
          case 'ReleaseEvent':
            this.currentState = 'DEPLOYING';
            this.lastActivityDesc = `Aelita lanzó una nueva versión en ${repoName}.`;
            break;
          default:
            this.currentState = 'IDLE';
            this.lastActivityDesc = `Aelita ha estado activa en GitHub recientemente.`;
            break;
        }
      } else {
        this.currentState = 'IDLE';
        this.lastActivityDesc = 'Sin actividad reciente en GitHub.';
      }
    } catch (e) {
      this.currentState = 'OFFLINE MODE';
      this.lastActivityDesc = 'No se pudo conectar a los servidores de GitHub.';
    }

    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: new Date().getTime(),
      state: this.currentState,
      desc: this.lastActivityDesc
    }));
  }

  // Terminal commands handlers
  public pet(): string {
    this.addExp(4);
    return `Aelita toleró tus mimos. +4 EXP (Nivel actual: ${this.getLevel()})`;
  }

  public giveTuna(): string {
    return `Inventory error: visitor has no tuna.`;
  }

  public inspectProject(currentTab: string): string {
    if (currentTab === 'about') return 'Aelita encontró información clasificada sobre su creadora.';
    if (currentTab === '') return 'Aelita encontró Angular, TypeScript y mucho CSS sospechoso.';
    return `Aelita está olfateando el área de ${currentTab}. Todo parece en orden.`;
  }

  public askSkill(): string {
    return '“Mi humana sabe más cosas de las que puso en esta tarjeta.”';
  }

  public getLevel(): string {
    if (this.exp < 20) return 'AELITA_EGG';
    if (this.exp < 50) return 'AELITA_KITTY';
    if (this.exp < 100) return 'CODE_CAT';
    if (this.exp < 200) return 'CYBER_NEKO';
    return 'ROOT_AELITA';
  }
}
