import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BotService, WinampSkin } from './service/bot.service';

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
  imports: [CommonModule, RouterModule, FormsModule],
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
      title: 'KUICHI MOBILE',
      subtitle: 'Servicios para tu mascota en tu móvil',
      url: 'https://aelstgermain.github.io/kuichiw',
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
  ) {}

  ngOnInit() {
    this.setCursor(localStorage.getItem('ael-cursor') || 'cursor1');
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
      this.isEditorialPage = url === '/';
      document.body.classList.toggle('index-page', url === '/');
      this.isMenuOpen = false;
      window.scrollTo({ top: 0 });
    });
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
  }

  @HostListener('window:mouseleave')
  onMouseLeave() {
    this.isCursorVisible = false;
  }

  @HostListener('window:mouseenter')
  onMouseEnter() {
    this.isCursorVisible = true;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProjectsDrawer() {
    this.isProjectsDrawerOpen = !this.isProjectsDrawerOpen;
  }

  setCursor(choice: string) {
    this.cursorChoice = choice;
    document.body.classList.remove('cursor-custom1','cursor-custom2','cursor-custom3','cursor-custom4','cursor-wand','use-custom-gif-cursor');
    
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
