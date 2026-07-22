import { Component, OnInit } from '@angular/core';
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
  cursorChoice = 'star';

  constructor(private router: Router) {}

  ngOnInit() {
    this.setCursor(localStorage.getItem('ael-cursor') || 'star');
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
      this.isEditorialPage = url === '/';
      this.isMenuOpen = false;
      window.scrollTo({ top: 0 });
    });
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }

  setCursor(choice: string) {
    this.cursorChoice = choice;
    document.body.classList.remove('cursor-heart','cursor-star','cursor-wand');
    if (choice !== 'system') document.body.classList.add(`cursor-${choice}`);
    localStorage.setItem('ael-cursor', choice);
  }
}
