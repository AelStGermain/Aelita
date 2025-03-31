import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/home/home.component';
import { GatoComponent } from './app/gato/gato.component';
import { MemoriceComponent } from './app/memorice/memorice.component';
import { PalabrasComponent } from './app/palabras/palabras.component';
import { VoiceRecognitionComponent } from './app/voice-recognition/voice-recognition.component';
import { LectorComponent } from './app/lector/lector.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gato', component: GatoComponent },
  { path: 'memorice', component: MemoriceComponent },
  { path: 'palabras', component: PalabrasComponent },
  { path: 'voice-recognition', component: VoiceRecognitionComponent },
  { path: 'lector', component: LectorComponent },

];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],  // Proporcionar las rutas aquí
});
