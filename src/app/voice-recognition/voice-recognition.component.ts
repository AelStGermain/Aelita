import { Component, OnInit } from '@angular/core';
import { VoiceRecognitionService } from '../service/voice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule


@Component({
  selector: 'app-voice-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-recognition.component.html',
  styleUrls: ['./voice-recognition.component.css']
})
export class VoiceRecognitionComponent implements OnInit {
  message: string = '';
  isRecording: boolean = false; // Estado de grabación

  constructor(public voiceRecognitionService: VoiceRecognitionService) {}

  ngOnInit() {
    this.voiceRecognitionService.init();
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    this.voiceRecognitionService.start();
    this.isRecording = true;
  }

  stopRecording() {
    this.voiceRecognitionService.stop();
    this.message += this.voiceRecognitionService.text;
    this.voiceRecognitionService.text = ''; // Limpiar texto después de detener
    this.isRecording = false;
  }

}
