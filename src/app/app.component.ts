import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isMenuOpen = false;
  isEditorialPage = true;
  cursorChoice = 'cursor1';
  activeGifCursor: string | null = null;
  cursorX = -100;
  cursorY = -100;
  isCursorVisible = false;

  private readonly cursorGifs: Record<string, string> = {
    cursor1: 'cursor.gif',
    cursor2: 'cursor2.gif',
    cursor3: 'cursor3.gif',
    cursor4: 'cursor4.gif'
  };

  constructor(private router: Router) {}

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

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }

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
