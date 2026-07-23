import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type AboutTab = 'profile' | 'stack' | 'experience' | 'portfolio' | 'target';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  activeTab: AboutTab = 'profile';
  coreSkills = ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'Data Integration'];
  skills = [
    'Spring MVC', 'Spring Security', 'JPA', 'Hibernate', 'Maven', 'Node.js', 'Express.js',
    'JavaScript', 'TypeScript', 'Angular', 'Ionic', 'PHP', 'Laravel', 'PostgreSQL',
    'Supabase', 'MySQL', 'Firebase', 'Cloud Firestore', 'H2 Database', 'Data Management',
    'Master Data Management', 'Data Validation', 'Data Enrichment', 'CSV', 'Microsoft Excel',
    'API Integration', 'CRUD', 'MVC Architecture', 'Layered Architecture', 'Authentication',
    'Authorization', 'Git', 'GitHub', 'GitHub Actions', 'Docker', 'Linux', 'Jest', 'Jasmine',
    'Software Testing', 'Agile', 'Scrum', 'Technical Documentation', 'Requirements Analysis',
    'Problem Solving', 'User-Centered Design', 'Training', 'Cross-functional Collaboration', 'English C1'
  ];

  readonly portfolioProjects = [
    {
      title: 'PATOTA',
      subtitle: 'App para convocar grupos y organizar paseos',
      url: 'https://aelstgermain.github.io/Patota',
      icon: '🐾',
      badge: 'WEB APP',
      desc: 'Plataforma interactiva para convocar grupos de personas, coordinar rutas al aire libre y organizar salidas recreativas en comunidad.',
      techs: ['JavaScript', 'HTML5/CSS3', 'Web App', 'UX/UI']
    },
    {
      title: 'KUICHI WEB',
      subtitle: 'Web para cuidar tus mascotas & mejores ofertas vet',
      url: 'https://aelstgermain.github.io/kuichiweb/',
      icon: '🐶',
      badge: 'VET PLATFORM',
      desc: 'Sistema web enfocado en la salud y bienestar animal. Permite conectar a dueños de mascotas con servicios veterinarios, registros médicos y las mejores ofertas.',
      techs: ['Java', 'Spring Boot', 'Angular', 'REST API']
    },
    {
      title: 'KUICHI APP',
      subtitle: 'Versión App móvil de Kuichi',
      url: 'https://aelstgermain.github.io/Kuichiapp',
      icon: '📱',
      badge: 'MOBILE APP',
      desc: 'Aplicación móvil de la plataforma Kuichi. Lleva todas las utilidades, promociones veterinarias y seguimiento de mascotas directamente al smartphone.',
      techs: ['Ionic', 'Angular', 'TypeScript', 'Mobile']
    }
  ];

  setTab(tab: AboutTab) {
    this.activeTab = tab;
  }
}
