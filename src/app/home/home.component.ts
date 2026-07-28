import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BotService } from '../service/bot.service';
import { RecruiterViewComponent } from './recruiter-view/recruiter-view.component';

export interface GitHubEventItem {
  repo: string;
  type: string;
  message: string;
  date: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RecruiterViewComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('radioCanvas', { static: false }) radioCanvas?: ElementRef<HTMLCanvasElement>;

  // Radio & Web Audio State
  radioOn = false;
  station: 'dream' | 'cosmic' | 'lofi' | 'synth' = 'dream';
  volume = 0.18;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private radioTimer?: number;
  private noteIndex = 0;
  private animFrameId = 0;
  private audioStreamEl?: HTMLAudioElement;

  // GitHub Live Activity State
  githubLoading = true;
  githubError = false;
  githubStats = {
    publicRepos: 18,
    followers: 12,
    following: 15,
    userBio: 'Software Developer & Systems Analyst Student'
  };
  githubEvents: GitHubEventItem[] = [
    { repo: 'AelStGermain/Aelita', type: 'PushEvent', message: 'feat: add recruiter mode & live radio visualizer', date: '2026-07-26' },
    { repo: 'AelStGermain/Patota', type: 'PushEvent', message: 'refactor: update group route management UI', date: '2026-07-25' },
    { repo: 'AelStGermain/kuichiweb', type: 'PushEvent', message: 'feat: add vet service booking API integration', date: '2026-07-22' }
  ];

  // Recruiter View Toggle & Tab State
  get isRecruiterMode(): boolean {
    return this.botService.isRecruiterMode;
  }
  set isRecruiterMode(val: boolean) {
    if (this.botService.isRecruiterMode !== val) {
      this.botService.toggleRecruiterMode();
    }
  }
  constructor(
    private router: Router,
    public botService: BotService
  ) {}

  ngOnInit(): void {
    this.fetchGitHubActivity();
  }

  toggleRecruiterMode(): void {
    this.botService.toggleRecruiterMode();
  }

  fetchGitHubActivity(): void {
    this.githubLoading = true;
    this.githubError = false;

    if (typeof fetch === 'undefined') {
      this.githubLoading = false;
      return;
    }

    // Fetch user stats
    fetch('https://api.github.com/users/AelStGermain')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.public_repos === 'number') {
          this.githubStats.publicRepos = data.public_repos;
          this.githubStats.followers = data.followers || 12;
          this.githubStats.following = data.following || 15;
          if (data.bio) this.githubStats.userBio = data.bio;
        }
      })
      .catch(() => {
        this.githubError = true;
      });

    // Fetch recent events
    fetch('https://api.github.com/users/AelStGermain/events/public')
      .then(res => res.json())
      .then((events: any[]) => {
        this.githubLoading = false;
        if (Array.isArray(events)) {
          const pushes = events
            .filter(e => e.type === 'PushEvent' || e.type === 'CreateEvent')
            .slice(0, 4)
            .map(e => {
              const repoName = (e.repo?.name || 'AelStGermain/repo').replace('AelStGermain/', '');
              const msg = e.payload?.commits?.[0]?.message || e.type.replace('Event', '');
              const date = new Date(e.created_at || Date.now()).toISOString().split('T')[0];
              return {
                repo: repoName,
                type: e.type,
                message: msg.length > 55 ? msg.substring(0, 52) + '...' : msg,
                date
              };
            });
          if (pushes.length > 0) {
            this.githubEvents = pushes;
          }
        }
      })
      .catch(() => {
        this.githubLoading = false;
      });
  }

  // Radio Methods
  toggleRadio(): void {
    this.radioOn ? this.stopRadio() : this.startRadio();
  }

  selectStation(station: 'dream' | 'cosmic' | 'lofi' | 'synth'): void {
    this.station = station;
    if (this.radioOn) {
      this.stopRadio();
      this.startRadio();
    }
  }

  startRadio(): void {
    this.audioContext ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
    }

    this.radioOn = true;

    if (this.station === 'lofi' || this.station === 'synth') {
      this.playStreamStation();
    } else {
      this.noteIndex = 0;
      this.playRadioNote();
      this.radioTimer = window.setInterval(() => this.playRadioNote(), 720);
    }

    this.startVisualizer();
  }

  stopRadio(): void {
    if (this.radioTimer) {
      window.clearInterval(this.radioTimer);
      this.radioTimer = undefined;
    }

    if (this.audioStreamEl) {
      this.audioStreamEl.pause();
      this.audioStreamEl.src = '';
      this.audioStreamEl = undefined;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }

    this.radioOn = false;
    this.clearCanvas();
  }

  setVolume(): void {
    if (this.audioStreamEl) {
      this.audioStreamEl.volume = this.volume;
    }
  }

  private playStreamStation(): void {
    const streamUrls: Record<string, string> = {
      lofi: 'https://ice1.somafm.com/groovesalad-128-mp3',
      synth: 'https://ice2.somafm.com/defcon-128-mp3'
    };

    const url = streamUrls[this.station];
    if (!url) return;

    this.audioStreamEl = new Audio();
    this.audioStreamEl.crossOrigin = 'anonymous';
    this.audioStreamEl.src = url;
    this.audioStreamEl.volume = this.volume;

    try {
      const source = this.audioContext!.createMediaElementSource(this.audioStreamEl);
      source.connect(this.analyser!);
      this.analyser!.connect(this.audioContext!.destination);
    } catch {
      // Fallback if media source connection has already been made
    }

    this.audioStreamEl.play().catch(() => {
      // Stream autoplay policy fallback
    });
  }

  private playRadioNote(): void {
    if (!this.audioContext || !this.analyser) return;

    const stations: Record<string, { notes: number[], wave: OscillatorType, tempo: number }> = {
      dream: { notes: [220, 277.18, 329.63, 415.3, 329.63, 277.18], wave: 'sine', tempo: 1.8 },
      cosmic: { notes: [146.83, 220, 293.66, 369.99, 293.66, 220], wave: 'triangle', tempo: 2.5 }
    };

    const preset = stations[this.station] || stations['dream'];
    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = preset.wave;
    osc.frequency.value = preset.notes[this.noteIndex++ % preset.notes.length];

    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume * 0.22), now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.tempo);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + preset.tempo + 0.05);
  }

  private startVisualizer(): void {
    if (!this.radioCanvas) return;
    const canvas = this.radioCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!this.radioOn) return;
      this.animFrameId = requestAnimationFrame(render);

      this.analyser!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 16) - 1;
      let x = 0;

      for (let i = 0; i < 16; i++) {
        const value = dataArray[i * 2] || (this.radioOn ? Math.sin(Date.now() / 150 + i) * 15 + 25 : 0);
        const barHeight = Math.min(canvas.height, (value / 255) * canvas.height + 2);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#ff4196');
        gradient.addColorStop(0.5, '#aa2bb8');
        gradient.addColorStop(1, '#70f3ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    render();
  }

  private clearCanvas(): void {
    if (!this.radioCanvas) return;
    const canvas = this.radioCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  readonly developerProjects = [
    {
      title: 'PATOTA',
      subtitle: 'App para convocar grupos y organizar paseos',
      url: 'https://aelstgermain.github.io/Patota',
      icon: '🐾',
      badge: 'WEB APP',
      desc: 'Plataforma interactiva para convocar grupos de personas, coordinar rutas al aire libre y organizar salidas recreativas en comunidad.',
      techs: ['JavaScript', 'HTML5/CSS3', 'Web App', 'UX/UI']
    },
    {
      title: 'KUICHI WEB',
      subtitle: 'Web para cuidar tus mascotas & mejores ofertas vet',
      url: 'https://aelstgermain.github.io/kuichiweb/',
      icon: '🐶',
      badge: 'VET PLATFORM',
      desc: 'Sistema web enfocado en la salud y bienestar animal. Conecta dueños de mascotas con servicios veterinarios, registros médicos y ofertas.',
      techs: ['Java', 'Spring Boot', 'Angular', 'REST API']
    },
    {
      title: 'KUICHI APP',
      subtitle: 'Versión App móvil de Kuichi',
      url: 'https://aelstgermain.github.io/kuichiapp',
      icon: '📱',
      badge: 'MOBILE APP',
      desc: 'Aplicación móvil de la plataforma Kuichi. Lleva todas las utilidades, promociones veterinarias y seguimiento de mascotas directamente al smartphone.',
      techs: ['Ionic', 'Angular', 'TypeScript', 'Mobile']
    }
  ];

  ngOnDestroy(): void {
    this.stopRadio();
    this.audioContext?.close();
  }

  openBot(): void {
    this.botService.openBot();
  }

  openPortfolio(): void {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
