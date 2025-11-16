import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lector.component.html',
  styleUrls: ['./lector.component.css']
})
export class LectorComponent {
  score = 0;
  currentWord = 'CASA';
  practiceWords = ['CASA', 'PERRO', 'GATO', 'SOL', 'LUNA', 'AGUA'];
  currentWordIndex = 0;
  
  isListening = false;
  recognizedText = '';
  recognition: any;
  showFeedback = false;
  isCorrect = false;

  constructor() {
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.recognizedText = transcript;
        
        if (event.results[event.results.length - 1].isFinal) {
          this.checkWord(transcript.toLowerCase().trim());
        }
      };
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.recognition?.stop();
      this.isListening = false;
    } else {
      this.recognition?.start();
      this.isListening = true;
      this.recognizedText = '';
    }
  }

  checkWord(spokenWord: string) {
    const targetWord = this.currentWord.toLowerCase();
    this.isCorrect = spokenWord.includes(targetWord) || targetWord.includes(spokenWord);
    
    if (this.isCorrect) {
      this.score++;
    }
    
    this.showFeedback = true;
    setTimeout(() => {
      this.showFeedback = false;
      if (this.isCorrect) {
        this.nextWord();
      }
    }, 2000);
  }

  nextWord() {
    this.currentWordIndex = (this.currentWordIndex + 1) % this.practiceWords.length;
    this.currentWord = this.practiceWords[this.currentWordIndex];
    this.recognizedText = '';
    this.showFeedback = false;
  }
}