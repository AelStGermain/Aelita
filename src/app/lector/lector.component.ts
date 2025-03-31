import { Component } from '@angular/core';

@Component({
  selector: 'app-lector',
  templateUrl: './lector.component.html',
  styleUrls: ['./lector.component.css']
})
export class LectorComponent {
  isListening: boolean = false;
  recognizedText: string = '';
  recognition: any;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.recognizedText += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        this.recognizedText = this.recognizedText + interimTranscript;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error en el reconocimiento de voz: ', event.error);
      };
    } else {
      console.warn('El reconocimiento de voz no es compatible con este navegador.');
    }
  }

  toggleListening(): void {
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
    this.isListening = !this.isListening;
  }

  clearText(): void {
    this.recognizedText = '';
  }
}