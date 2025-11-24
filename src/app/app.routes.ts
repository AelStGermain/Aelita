import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GatoComponent } from './gato/gato.component';
import { MemoriceComponent } from './memorice/memorice.component';
import { LectorComponent } from './lector/lector.component';
import { PalabrasComponent } from './palabras/palabras.component';
import { SnakeComponent } from './snake/snake.component';
import { AboutComponent } from './about/about.component';
import { CipherComponent } from './cipher/cipher.component';
import { CtfComponent } from './ctf/ctf.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gato', component: GatoComponent },
  { path: 'memorice', component: MemoriceComponent },
  { path: 'palabras', component: PalabrasComponent },
  { path: 'snake', component: SnakeComponent },
  { path: 'lector', component: LectorComponent },
  { path: 'cipher', component: CipherComponent },
  { path: 'ctf', component: CtfComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];

