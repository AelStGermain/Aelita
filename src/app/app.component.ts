import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BotService, Y2kFrame } from './service/bot.service';
import { NekoComponent } from './neko/neko.component';

export interface DeveloperProject {
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  tag: string;
  description: string;
  techs: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NekoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isMenuOpen = false;
  isProjectsDrawerOpen = false;
  isEditorialPage = true;
  cursorChoice = 'cursor1';
  activeGifCursor: string | null = null;
  cursorX = -100;
  cursorY = -100;
  isCursorVisible = false;
  get isRecruiterMode(): boolean {
    return this.botService.isRecruiterMode;
  }
  set isRecruiterMode(val: boolean) {
    if (this.botService.isRecruiterMode !== val) {
      this.botService.toggleRecruiterMode();
    }
  }

  showViewPromptModal = false;

  // Draggable AEL_BOT launcher button state
  launcherPos = { x: 0, y: 0 };
  private isDraggingLauncher = false;
  private hasMovedLauncher = false;
  private dragStart = { x: 0, y: 0 };
  private launcherStart = { x: 0, y: 0 };

  readonly internalGames = [
    { title: 'CYBER CTF', path: '/ctf', icon: '🛡️', badge: 'SECURITY', desc: 'Desafíos de seguridad' },
    { title: 'LECTOR MÁGICO', path: '/lector', icon: '🎤', badge: 'VOICE API', desc: 'Reconocimiento de voz' },
    { title: 'CIPHER TERMINAL', path: '/cipher', icon: '🔐', badge: 'CRYPTO', desc: 'Codifica secretos' },
    { title: 'BATALLA NAVAL', path: '/batalla-naval', icon: '🚢', badge: 'STRATEGY', desc: 'Estrategia y estado' },
    { title: 'SNAKE RETRO', path: '/snake', icon: '🐍', badge: 'ARCADE', desc: 'Arcade clásico' },
    { title: 'MEMORICE', path: '/memorice', icon: '⚡', badge: 'MEMORY', desc: 'Encuentra parejas' },
    { title: 'PALABRAS', path: '/palabras', icon: '🌻', badge: 'LEARNING', desc: 'Aprende jugando' },
    { title: 'TRES EN RAYA', path: '/gato', icon: '🎮', badge: 'RETRO', desc: 'Tic-Tac-Toe retro' }
  ];

  readonly developerProjects: DeveloperProject[] = [
    {
      title: 'PATOTA',
      subtitle: 'Convoca grupos y organiza paseos',
      url: 'https://aelstgermain.github.io/Patota',
      icon: '🐾',
      tag: 'WEB APP',
      description: 'Aplicación para convocar grupos de personas y coordinar paseos o actividades al aire libre.',
      techs: ['Web App', 'JavaScript', 'UX/UI']
    },
    {
      title: 'KUICHI WEB',
      subtitle: 'Cuidado de mascotas & ofertas vet',
      url: 'https://aelstgermain.github.io/kuichiweb/',
      icon: '🐶',
      tag: 'VET PLATFORM',
      description: 'Plataforma web para cuidar a tus mascotas y encontrar las mejores ofertas y servicios veterinarios.',
      techs: ['Spring Boot', 'Java', 'Angular']
    },
    {
      title: 'KUICHI APP',
      subtitle: 'Servicios para tu mascota en tu móvil',
      url: 'https://aelstgermain.github.io/kuichiapp',
      icon: '📱',
      tag: 'MOBILE APP',
      description: 'Versión App de Kuichi: ofertas veterinarias y atención de mascotas directamente en tu celular.',
      techs: ['Ionic', 'Angular', 'Mobile']
    }
  ];

  private readonly cursorGifs: Record<string, string> = {
    cursor1: 'cursor.gif',
    cursor2: 'cursor2.gif',
    cursor3: 'cursor3.gif',
    cursor4: 'cursor4.gif'
  };

  constructor(
    private router: Router,
    public botService: BotService
  ) { }

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const prompted = localStorage.getItem('ael_view_prompted');
      if (!prompted) {
        this.showViewPromptModal = true;
      }
    }
    this.setCursor(localStorage.getItem('ael-cursor') || 'cursor1');
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
      this.isEditorialPage = url === '/';
      document.body.classList.toggle('index-page', url === '/');
      this.isMenuOpen = false;
      window.scrollTo({ top: 0 });
    });
  }

  toggleRecruiterMode() {
    this.botService.toggleRecruiterMode();
  }

  chooseViewMode(mode: 'recruiter' | 'personal') {
    const targetVal = mode === 'recruiter';
    if (this.botService.isRecruiterMode !== targetVal) {
      this.botService.toggleRecruiterMode();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ael_view_prompted', 'true');
    }
    this.showViewPromptModal = false;
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      event.preventDefault();
      this.botService.openBot();
    }
    if (event.key === 'Escape') {
      this.botService.closeBot();
      this.isProjectsDrawerOpen = false;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
    if (!this.isCursorVisible) {
      this.isCursorVisible = true;
    }

    if (this.isDraggingLauncher) {
      const deltaX = event.clientX - this.dragStart.x;
      const deltaY = event.clientY - this.dragStart.y;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        this.hasMovedLauncher = true;
      }
      this.launcherPos = {
        x: this.launcherStart.x + deltaX,
        y: this.launcherStart.y + deltaY
      };
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    if (this.isDraggingLauncher) {
      this.isDraggingLauncher = false;
    }
  }

  @HostListener('window:mouseleave')
  onMouseLeave() {
    this.isCursorVisible = false;
    this.isDraggingLauncher = false;
  }

  @HostListener('window:mouseenter')
  onMouseEnter() {
    this.isCursorVisible = true;
  }

  startLauncherDrag(event: MouseEvent | TouchEvent) {
    this.isDraggingLauncher = true;
    this.hasMovedLauncher = false;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.dragStart = { x: clientX, y: clientY };
    this.launcherStart = { ...this.launcherPos };
  }

  onLauncherClick(event: MouseEvent) {
    if (this.hasMovedLauncher) {
      event.preventDefault();
      event.stopPropagation();
      this.hasMovedLauncher = false;
      return;
    }
    this.botService.toggleBot();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProjectsDrawer() {
    this.isProjectsDrawerOpen = !this.isProjectsDrawerOpen;
  }

  closeProjectsDrawerOnNav() {
    this.isProjectsDrawerOpen = false;
  }

  scrollToProjects(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.isMenuOpen = false;
    if (this.isEditorialPage) {
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById('projects');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    }
  }

  setCursor(choice: string) {
    this.cursorChoice = choice;
    document.body.classList.remove('cursor-custom1', 'cursor-custom2', 'cursor-custom3', 'cursor-custom4', 'cursor-wand', 'use-custom-gif-cursor');

    if (this.cursorGifs[choice]) {
      this.activeGifCursor = this.cursorGifs[choice];
      document.body.classList.add('use-custom-gif-cursor', `cursor-${choice}`);
    } else {
      this.activeGifCursor = null;
      if (choice === 'wand') {
        document.body.classList.add('cursor-wand');
      }
    }

    localStorage.setItem('ael-cursor', choice);
  }
}
