import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Asegúrate de importar RouterModule

@Component({
  selector: 'app-root',
  standalone: true,  // Asegúrate de que este componente sea standalone
  imports: [RouterModule],  // Agregar RouterModule a los imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
