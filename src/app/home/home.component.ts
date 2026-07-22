import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type ConsoleCommand = 'help' | 'skills' | 'projects' | 'about' | 'contact' | 'clear';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  consoleOpen = false;
  command = '';
  history = ['AEL_OS 1.0 — sesión invitada iniciada.', 'Escribe “help” para ver los comandos.'];

  constructor(private router: Router) {}

  @HostListener('document:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      event.preventDefault();
      this.consoleOpen = true;
      setTimeout(() => document.querySelector<HTMLInputElement>('.console-input')?.focus());
    }
    if (event.key === 'Escape') this.consoleOpen = false;
  }

  openConsole() {
    this.consoleOpen = true;
    setTimeout(() => document.querySelector<HTMLInputElement>('.console-input')?.focus());
  }

  runCommand() {
    const value = this.command.trim().toLowerCase() as ConsoleCommand;
    if (!value) return;
    this.history.push(`ael@portfolio:~$ ${value}`);
    const responses: Record<Exclude<ConsoleCommand, 'clear'>, string> = {
      help: 'Comandos: skills · projects · about · contact · clear',
      skills: 'Angular · TypeScript · APIs del navegador · UI responsive · ciberseguridad · diseño de experiencias educativas',
      projects: '8 experimentos interactivos: CTF, cifrado, voz, Snake, memoria, palabras, batalla naval y tres en raya.',
      about: 'Abriendo PROFILE.EXE…',
      contact: 'La mejor forma de iniciar contacto está en la sección Sobre mí.'
    };
    if (value === 'clear') this.history = [];
    else if (value in responses) {
      this.history.push(responses[value as Exclude<ConsoleCommand, 'clear'>]);
      if (value === 'about') setTimeout(() => this.router.navigate(['/about']), 450);
    } else {
      this.history.push(`Comando no encontrado: ${value}. Prueba “help”.`);
    }
    this.command = '';
  }
}
