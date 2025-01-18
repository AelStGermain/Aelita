import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/home/home.component';
import { GatoComponent } from './app/gato/gato.component';
import { MemoriceComponent } from './app/memorice/memorice.component';
import { PalabrasComponent } from './app/palabras/palabras.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'gato', component: GatoComponent },
  { path: 'memorice', component: MemoriceComponent },
  { path: 'palabras', component: PalabrasComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirigir al inicio
  { path: '**', redirectTo: '/home' }, // Manejo de rutas inexistentes
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
});
