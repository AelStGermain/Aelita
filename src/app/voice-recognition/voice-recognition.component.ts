import { Component, OnInit } from '@angular/core';
import { VoiceRecognitionService } from '../service/voice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-voice-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-recognition.component.html',
  styleUrls: ['./voice-recognition.component.css']
})
export class VoiceRecognitionComponent implements OnInit {
  palabras: string[] = ['Casa', 'Gato', 'Árbol', 'Mesa', 'Niño', 'Perro', 'Cielo', 'Flor', 'Sol', 'Parque', 'Ventana', 'Cuchara', 'Bicicleta', 'Ratón', 'Escuela', 'Libro', 'Zapato', 'Fruta', 'Estrella', 'Jardín'];
  palabraSeleccionada: string = '';
  palabraMostrada: string[] = [];
  correctas: boolean[] = [];
  isRecording: boolean = false;
  mensajeError: string | null = null;
  realTimeText: string = ''; // Texto en tiempo real

  constructor(public voiceRecognitionService: VoiceRecognitionService) {}

  ngOnInit() {
    this.voiceRecognitionService.init();
    this.seleccionarPalabra();
  }

  seleccionarPalabra() {
    this.palabraSeleccionada = this.palabras[Math.floor(Math.random() * this.palabras.length)];
    this.palabraMostrada = this.palabraSeleccionada.split(''); // Dividir la palabra en letras
    this.correctas = Array(this.palabraMostrada.length).fill(false);
  }

  startRecording() {
    this.voiceRecognitionService.start();
    this.isRecording = true;
    this.realTimeText = '';
    this.voiceRecognitionService.recognition.onresult = (event: any) => {
      this.realTimeText = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      this.checkPronunciation(this.realTimeText);
    };
  }

  stopRecording() {
    this.voiceRecognitionService.stop();
    this.isRecording = false;
  }

  reanudar() {
    this.seleccionarPalabra();
    this.realTimeText = '';
    this.mensajeError = null;
  }

  checkPronunciation(transcript: string) {
    const letrasLeidas = transcript.toLowerCase().trim().split('');

    this.correctas = this.palabraMostrada.map((letra, i) => {
      return letrasLeidas[i] !== undefined && letrasLeidas[i] === letra.toLowerCase();
    });

    this.mensajeError = this.correctas.every(correcta => correcta) ? 'Leído correctamente' : '¡Error en la pronunciación!';
  }
}
