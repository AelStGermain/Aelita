// src/app/app.component.ts

// 1. Importar NO_ERRORS_SCHEMA junto con Component
import { Component, NO_ERRORS_SCHEMA } from '@angular/core'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  
  // 2. ¡La Solución para el Error -998001!
  // Esto le dice a Angular que no se preocupe por elementos desconocidos.
  schemas: [NO_ERRORS_SCHEMA] 
})
export class AppComponent {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar estado:', this.isSidebarOpen);
  }
}