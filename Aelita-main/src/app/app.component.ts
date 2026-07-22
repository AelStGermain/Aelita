// src/app/app.component.ts

// 1. Importar NO_ERRORS_SCHEMA junto con Component
import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importa aquí los componentes que usas en el template
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  schemas: [NO_ERRORS_SCHEMA] // Permite elementos personalizados como <widgetbot>
})
export class AppComponent implements OnInit {
  isSidebarOpen = false;
  isMobileChatOpen = false;
  isAboutPage = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAboutPage = event.url === '/about';
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar estado:', this.isSidebarOpen);
  }

  toggleMobileChat() {
    this.isMobileChatOpen = !this.isMobileChatOpen;
  }
}
