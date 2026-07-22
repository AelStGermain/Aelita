import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type AboutTab = 'profile' | 'stack' | 'experience' | 'target';

@Component({selector:'app-about',standalone:true,imports:[CommonModule],templateUrl:'./about.component.html',styleUrls:['./about.component.css']})
export class AboutComponent {
  activeTab: AboutTab = 'profile';
  coreSkills = ['Java','Spring Boot','REST APIs','SQL','Data Integration'];
  skills = ['Spring MVC','Spring Security','JPA','Hibernate','Maven','Node.js','Express.js','JavaScript','TypeScript','Angular','Ionic','PHP','Laravel','PostgreSQL','Supabase','MySQL','Firebase','Cloud Firestore','H2 Database','Data Management','Master Data Management','Data Validation','Data Enrichment','CSV','Microsoft Excel','API Integration','CRUD','MVC Architecture','Layered Architecture','Authentication','Authorization','Git','GitHub','GitHub Actions','Docker','Linux','Jest','Jasmine','Software Testing','Agile','Scrum','Technical Documentation','Requirements Analysis','Problem Solving','User-Centered Design','Training','Cross-functional Collaboration','English C1'];
  setTab(tab: AboutTab){this.activeTab=tab;}
}
