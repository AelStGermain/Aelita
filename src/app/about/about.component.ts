import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  skills = [
    { name: 'JavaScript/TypeScript', level: 85 },
    { name: 'Angular', level: 80 },
    { name: 'Python', level: 75 },
    { name: 'Linux', level: 90 },
    { name: 'Ciberseguridad', level: 70 },
    { name: 'HTML/CSS', level: 95 }
  ];
}