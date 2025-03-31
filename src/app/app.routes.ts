//import { Routes } from '@angular/router';
//import { HomeComponent } from './home/home.component';
//import { GatoComponent } from './gato/gato.component';

//export const routes: Routes = [
//  { path: '', redirectTo: '/home', pathMatch: 'full' },
//  { path: 'home', component: HomeComponent },
//  { path: 'gato', component: GatoComponent },
//];
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GatoComponent } from './gato/gato.component';
import { MemoriceComponent } from './memorice/memorice.component'; // Importar MemoriceComponent
import { VoiceRecognitionComponent } from './voice-recognition/voice-recognition.component'; // Importar Voice
import { LectorComponent } from './lector/lector.component'; // Importar Voice


export const appRoutes: Routes = [
  { path: '', component: HomeComponent },  // Ruta para la página de inicio
  { path: 'gato', component: GatoComponent },  // Ruta para el juego Tic Tac Toe
  { path: 'memorice', component: MemoriceComponent },  // Ruta para el juego Memorice
  { path: 'voice-recognition', component: VoiceRecognitionComponent },  // Ruta para la página de reconocimiento de voz
  { path: 'lector', component: LectorComponent },  // Ruta para la página de reconocimiento de voz

];
