import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  recognition: any;
  isRecording = false;
  text = '';

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES'; // Configurar idioma a español
      this.recognition.continuous = true; // Permitir reconocimiento continuo
      this.recognition.interimResults = true; // Mostrar resultados intermedios

      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        this.text = transcript;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          this.recognition.start(); // Reiniciar reconocimiento de voz si está grabando
        }
      };
    } else {
      console.error('SpeechRecognition no es compatible con este navegador.');
    }
  }

  init() {
    this.text = '';
  }

  start() {
    if (this.recognition) {
      this.isRecording = true;
      this.recognition.start();
    }
  }

  stop() {
    if (this.recognition) {
      this.isRecording = false;
      this.recognition.stop();
    }
  }
}
