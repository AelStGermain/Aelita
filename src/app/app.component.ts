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

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
      this.isEditorialPage = url === '/' || url === '/about';
      this.isMenuOpen = false;
      window.scrollTo({ top: 0 });
    });
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
}
