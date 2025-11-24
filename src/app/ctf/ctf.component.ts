import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Challenge {
  id: number;
  title: string;
  description: string;
  hint: string;
  flag: string;
  completed: boolean;
  points: number;
  category: string;
}

@Component({
  selector: 'app-ctf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ctf.component.html',
  styleUrls: ['./ctf.component.css']
})
export class CtfComponent implements OnInit {
  challenges: Challenge[] = [
    {
      id: 1,
      title: 'BRECHA CÉSAR',
      description: `Se interceptó un mensaje secreto:\n\n"KHOOR ZRUOG! WKH IODJ LV: FBE3U_Q00E"\n\nEl desplazamiento de cifrado es 3. Descifra para encontrar la bandera.`,
      hint: 'Desplaza cada letra 3 posiciones hacia atrás en el alfabeto.',
      flag: 'CYBER_K00B',
      completed: false,
      points: 100,
      category: 'CRIPTOGRAFÍA'
    },
    {
      id: 2,
      title: 'CAPAS BASE64',
      description: `Codificación multicapa detectada:\n\n"VTBkU1RGOVRNRk5VTVZKSlEwRlVTVTlPIg=="\n\nDecodifica todas las capas para revelar la bandera.`,
      hint: 'Decodifica Base64 múltiples veces hasta obtener texto legible.',
      flag: 'M0R3_OB5FUSCATION',
      completed: false,
      points: 150,
      category: 'CODIFICACIÓN'
    },
    {
      id: 3,
      title: 'OCULTO A SIMPLE VISTA',
      description: `Encuentra el mensaje oculto en este arte ASCII:\n\n███████╗██╗      █████╗  ██████╗ \n██╔════╝██║     ██╔══██╗██╔════╝ \n█████╗  ██║     ███████║██║  ███╗\n██╔══╝  ██║     ██╔══██║██║   ██║\n██║     ███████╗██║  ██║╚██████╔╝\n╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝ \n\nLa bandera es lo que ves.`,
      hint: 'Lee el arte ASCII como texto. ¿Qué palabra deletrea?',
      flag: 'FLAG',
      completed: false,
      points: 200,
      category: 'ESTEGANOGRAFÍA'
    },
    {
      id: 4,
      title: 'VULNERABILIDAD DE CÓDIGO',
      description: `Encuentra el fallo de seguridad en este código:\n\n\`\`\`javascript\nfunction login(username, password) {\n  const query = "SELECT * FROM users WHERE \n    username='" + username + "' AND \n    password='" + password + "'";\n  return db.execute(query);\n}\n\`\`\`\n\n¿A qué tipo de ataque es vulnerable esto?`,
      hint: 'Piensa qué pasa si alguien ingresa: admin\' OR \'1\'=\'1',
      flag: 'SQL_INJECTION',
      completed: false,
      points: 250,
      category: 'ANÁLISIS DE CÓDIGO'
    },
    {
      id: 5,
      title: 'ROMPEDOR DE HASH',
      description: `Se encontró un hash de contraseña:\n\nSHA-256: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8\n\nContraseñas comunes: admin, password, 123456, qwerty, letmein\n\n¿Qué contraseña coincide con el hash?`,
      hint: 'Hashea cada contraseña común con SHA-256 y compara.',
      flag: 'password',
      completed: false,
      points: 300,
      category: 'CRIPTANALISIS'
    }
  ];

  currentChallengeIndex: number = 0;
  userInput: string = '';
  score: number = 0;
  totalPoints: number = 1000;
  attempts: number = 0;
  showHint: boolean = false;
  hintPenalty: number = 25;
  gameCompleted: boolean = false;
  startTime: number = 0;
  elapsedTime: number = 0;
  timerInterval: any;
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' | 'info' = 'info';

  ngOnInit() {
    this.loadProgress();
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get currentChallenge(): Challenge {
    return this.challenges[this.currentChallengeIndex];
  }

  get completedChallenges(): number {
    return this.challenges.filter(c => c.completed).length;
  }

  get progressPercentage(): number {
    return (this.completedChallenges / this.challenges.length) * 100;
  }

  submitFlag() {
    this.attempts++;
    const normalizedInput = this.userInput.trim().toUpperCase();
    const normalizedFlag = this.currentChallenge.flag.toUpperCase();

    if (normalizedInput === normalizedFlag) {
      // Correct answer!
      this.currentChallenge.completed = true;
      this.score += this.currentChallenge.points;
      this.feedbackMessage = `✅ ¡CORRECTO! +${this.currentChallenge.points} puntos`;
      this.feedbackType = 'success';

      setTimeout(() => {
        if (this.currentChallengeIndex < this.challenges.length - 1) {
          this.currentChallengeIndex++;
          this.userInput = '';
          this.showHint = false;
          this.feedbackMessage = '';
        } else {
          this.completeGame();
        }
      }, 2000);
    } else {
      // Wrong answer
      this.feedbackMessage = '❌ ¡INCORRECTO! Intenta de nuevo o usa una pista.';
      this.feedbackType = 'error';
    }

    this.saveProgress();
  }

  useHint() {
    if (!this.showHint) {
      this.showHint = true;
      this.score = Math.max(0, this.score - this.hintPenalty);
      this.feedbackMessage = `💡 ¡Pista revelada! -${this.hintPenalty} puntos`;
      this.feedbackType = 'info';
    }
  }

  skipChallenge() {
    if (this.currentChallengeIndex < this.challenges.length - 1) {
      this.currentChallengeIndex++;
      this.userInput = '';
      this.showHint = false;
      this.feedbackMessage = '⏭️ Desafío saltado (sin puntos otorgados)';
      this.feedbackType = 'info';
    }
  }

  completeGame() {
    this.gameCompleted = true;
    clearInterval(this.timerInterval);
    this.saveProgress();
  }

  resetGame() {
    this.challenges.forEach(c => c.completed = false);
    this.currentChallengeIndex = 0;
    this.score = 0;
    this.attempts = 0;
    this.userInput = '';
    this.showHint = false;
    this.gameCompleted = false;
    this.feedbackMessage = '';
    this.startTime = Date.now();
    this.elapsedTime = 0;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);

    this.saveProgress();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  saveProgress() {
    const progress = {
      challenges: this.challenges,
      currentIndex: this.currentChallengeIndex,
      score: this.score,
      attempts: this.attempts,
      gameCompleted: this.gameCompleted
    };
    localStorage.setItem('ctf_progress', JSON.stringify(progress));
  }

  loadProgress() {
    const saved = localStorage.getItem('ctf_progress');
    if (saved) {
      const progress = JSON.parse(saved);
      this.challenges = progress.challenges;
      this.currentChallengeIndex = progress.currentIndex;
      this.score = progress.score;
      this.attempts = progress.attempts;
      this.gameCompleted = progress.gameCompleted;
    }
  }

  getScoreRank(): string {
    const percentage = (this.score / this.totalPoints) * 100;
    if (percentage >= 90) return 'HACKER DE ÉLITE';
    if (percentage >= 75) return 'HACKER HÁBIL';
    if (percentage >= 50) return 'SCRIPT KIDDIE';
    if (percentage >= 25) return 'NOVATO';
    return 'NOOB';
  }
}
