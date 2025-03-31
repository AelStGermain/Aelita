import { Injectable } from '@angular/core';

interface CustomWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private recognition: any;

  constructor() {
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as CustomWindow;
    this.recognition = new (SpeechRecognition || webkitSpeechRecognition)();
    this.recognition.lang = 'es-ES';
  }

  startRecognition(onResult: (transcript: string) => void) {
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    this.recognition.start();
  }

  stopRecognition() {
    this.recognition.stop();
  }
}
