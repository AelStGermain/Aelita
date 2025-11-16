import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-palabras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './palabras.component.html',
  styleUrls: ['./palabras.component.css']
})
export class PalabrasComponent {
  palabras: string[] = ['casa', 'flor', 'sol', 'luna', 'gato', 'perro', 'agua', 'fuego', 'amor', 'paz'];
  palabraSeleccionada: string = '';
  palabraMostrada: string[] = [];
  letrasDisponibles: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  letrasIncorrectas: string[] = [];
  letrasCorrectas: string[] = [];
  intentosRestantes: number = 6;
  mensaje: string | null = null;
  juegoTerminado: boolean = false;
  puntos: number = 0;
  mensajeFinal: string = '';
  esVictoria: boolean = false;
  
  // Elementos visuales del jardín
  flores: any[] = [];
  corazones: string[] = [];
  nubesError: string[] = [];

  constructor() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.mensaje = null;
    this.juegoTerminado = false;
    this.intentosRestantes = 6;
    this.mensajeFinal = '';
    this.letrasIncorrectas = [];
    this.letrasCorrectas = [];
    this.nubesError = [];
    this.esVictoria = false;
    
    this.palabraSeleccionada = this.palabras[Math.floor(Math.random() * this.palabras.length)];
    this.palabraMostrada = Array(this.palabraSeleccionada.length).fill('_');
    
    // Crear flores según las letras únicas de la palabra
    const letrasUnicas = [...new Set(this.palabraSeleccionada.split(''))];
    this.flores = Array(letrasUnicas.length).fill(0).map((_, i) => ({ id: i }));
    
    // Crear corazones de vida
    this.corazones = Array(6).fill('❤️');
  }

  elegirLetra(letra: string) {
    if (this.juegoTerminado || this.letraUsada(letra)) {
      return;
    }

    if (this.palabraSeleccionada.includes(letra)) {
      this.letrasCorrectas.push(letra);
      this.actualizarPalabra(letra);
      this.mensaje = '¡Bien! 🌸 Una flor ha florecido';
    } else {
      this.letrasIncorrectas.push(letra);
      this.intentosRestantes--;
      this.corazones.pop();
      this.nubesError.push('☁️');
      this.mensaje = '¡Ups! ☁️ Apareció una nube';
    }

    setTimeout(() => this.mensaje = null, 1500);

    if (this.intentosRestantes === 0) {
      this.terminarJuego(false);
    } else if (!this.palabraMostrada.includes('_')) {
      this.terminarJuego(true);
    }
  }

  actualizarPalabra(letra: string) {
    for (let i = 0; i < this.palabraSeleccionada.length; i++) {
      if (this.palabraSeleccionada[i] === letra) {
        this.palabraMostrada[i] = letra;
      }
    }
  }

  letraUsada(letra: string): boolean {
    return this.letrasCorrectas.includes(letra) || this.letrasIncorrectas.includes(letra);
  }

  terminarJuego(gano: boolean) {
    this.juegoTerminado = true;
    this.esVictoria = gano;
    
    if (gano) {
      this.puntos += 10;
      this.mensajeFinal = '¡Felicidades! Tu jardín está hermoso 🌺';
    } else {
      this.mensajeFinal = `El jardín se marchitó... La palabra era: ${this.palabraSeleccionada.toUpperCase()}`;
    }
  }

  reiniciarJuego() {
    this.iniciarJuego();
  }
}
