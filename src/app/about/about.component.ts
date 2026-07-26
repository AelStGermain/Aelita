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
  
  readonly coreSkills = [
    'Java',
    'Spring Boot',
    'REST APIs',
    'SQL',
    'Systems & Data Integration'
  ];

  readonly stackGroups = [
    {
      category: 'BACKEND',
      skills: ['Spring MVC', 'Spring Security', 'JPA / Hibernate', 'Node.js', 'Express.js', 'PHP', 'Laravel', 'Maven']
    },
    {
      category: 'WEB_AND_MOBILE',
      skills: ['JavaScript', 'TypeScript', 'Angular', 'Ionic', 'HTML5 / CSS3']
    },
    {
      category: 'DATA',
      skills: ['PostgreSQL', 'MySQL', 'Supabase', 'Firebase (Cloud Firestore)', 'H2 Database', 'Master Data Management', 'Data Validation', 'Data Enrichment', 'CSV', 'Microsoft Excel']
    },
    {
      category: 'ARCHITECTURE_AND_INTEGRATION',
      skills: ['MVC Architecture', 'Layered Architecture', 'Authentication & Authorization', 'CRUD Operations']
    },
    {
      category: 'TOOLS_AND_DELIVERY',
      skills: ['Git', 'GitHub', 'GitHub Actions', 'Docker', 'Linux', 'Jest', 'Jasmine', 'Software Testing']
    },
    {
      category: 'PROFESSIONAL_SKILLS',
      skills: ['Agile / Scrum', 'Requirements Analysis', 'Technical Documentation', 'User Training', 'Problem Solving', 'User-Centered Design', 'Cross-functional Collaboration']
    }
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
      url: 'https://aelstgermain.github.io/kuichiapp',
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
