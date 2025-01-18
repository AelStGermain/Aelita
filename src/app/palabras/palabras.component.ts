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
  palabras: string[] = ['gato', 'perro', 'elefante', 'raton', 'flor', 'planta', 'computadora', 'juguete', 'coche', 'camisa'];
  palabraSeleccionada: string = '';
  palabraMostrada: string[] = [];
  letrasDisponibles: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  letrasIncorrectas: string[] = [];
  intentosRestantes: number = 6;
  orugaASCII: string = `         ____\n        /    \\\n       |      |\n       |      |\n       |______|\n      (O) (O)\n`; // Oruga inicial
  mensaje: string | null = null;
  juegoTerminado: boolean = false;
  puntos: number = 0;
  mensajeFinal: string = '';

  constructor() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.mensaje = null;
    this.juegoTerminado = false;
    this.intentosRestantes = 6;
    this.puntos = 0;
    this.mensajeFinal = '';
    this.letrasIncorrectas = [];
    this.palabraSeleccionada = this.palabras[Math.floor(Math.random() * this.palabras.length)];
    this.palabraMostrada = Array(this.palabraSeleccionada.length).fill('_');
    this.orugaASCII = `         ____\n        /    \\\n       |      |\n       |      |\n       |______|\n      (O) (O)\n`; // Oruga inicial
  }

  elegirLetra(letra: string) {
    if (this.juegoTerminado || this.letrasIncorrectas.includes(letra)) {
      return;
    }

    if (this.palabraSeleccionada.includes(letra)) {
      this.actualizarPalabra(letra);
      this.actualizarOruga();
    } else {
      this.letrasIncorrectas.push(letra);
      this.intentosRestantes--;
    }

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

  actualizarOruga() {
    // Añadir una nueva parte al cuerpo de la oruga cada vez que se acierta una letra
    this.orugaASCII += `(O) `;
  }

  terminarJuego(gano: boolean) {
    this.juegoTerminado = true;
    if (gano) {
      this.puntos += 10;
      this.mensajeFinal = '¡Felicidades, has ganado!';
    } else {
      this.mensajeFinal = `¡Oh no! Has perdido. La palabra era: ${this.palabraSeleccionada}`;
    }
  }

  reiniciarJuego() {
    this.iniciarJuego();
  }
}
