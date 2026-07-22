import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  emoji: string;
  delay: number;
}

@Component({
  selector: 'app-gato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gato.component.html',
  styleUrls: ['./gato.component.css'],
})
export class GatoComponent {
  board: string[][] = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];
  currentPlayer: string = 'X';
  winner: string | null = null;
  isDraw: boolean = false;
  isPlayerTurn: boolean = true;
  
  // Sistema de puntuación
  playerScore: number = 0;
  cpuScore: number = 0;
  
  // Efectos visuales
  winningCells: number[][] = [];
  showParticles: boolean = false;
  particles: Particle[] = [];

  constructor() {
    this.resetGame();
  }

  resetGame() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    this.currentPlayer = 'X';
    this.winner = null;
    this.isDraw = false;
    this.isPlayerTurn = true;
    this.winningCells = [];
    this.showParticles = false;
    this.particles = [];
  }

  newMatch() {
    this.resetGame();
    this.playerScore = 0;
    this.cpuScore = 0;
  }

  play(row: number, col: number) {
    if (this.isPlayerTurn && this.board[row][col] === '' && this.winner === null && !this.isDraw) {
      this.board[row][col] = this.currentPlayer;
      this.isPlayerTurn = false;
      this.createParticleEffect(row, col, '⚡');

      if (this.checkWinner()) {
        this.winner = this.currentPlayer;
        this.playerScore++;
        this.celebrateWin();
      } else if (this.isBoardFull()) {
        this.isDraw = true;
      } else {
        this.currentPlayer = 'O';
        setTimeout(() => {
          this.computerMove();
        }, 800);
      }
    }
  }

  computerMove() {
    // IA mejorada: intenta ganar, luego bloquear, luego movimiento aleatorio
    const move = this.getBestMove();
    
    if (move) {
      this.board[move.row][move.col] = 'O';
      this.createParticleEffect(move.row, move.col, '🔥');

      if (this.checkWinner()) {
        this.winner = 'O';
        this.cpuScore++;
        this.celebrateWin();
      } else if (this.isBoardFull()) {
        this.isDraw = true;
      } else {
        this.currentPlayer = 'X';
        this.isPlayerTurn = true;
      }
    }
  }

  getBestMove(): {row: number, col: number} | null {
    let bestScore = -Infinity;
    let bestMove: {row: number, col: number} | null = null;
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      if (this.board[row][col] !== '') continue;
      this.board[row][col] = 'O';
      const score = this.minimax(false, 0);
      this.board[row][col] = '';
      if (score > bestScore) { bestScore = score; bestMove = {row, col}; }
    }
    return bestMove;
  }

  minimax(maximizing: boolean, depth: number): number {
    const result = this.boardWinner();
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (this.isBoardFull()) return 0;
    let best = maximizing ? -Infinity : Infinity;
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      if (this.board[row][col] !== '') continue;
      this.board[row][col] = maximizing ? 'O' : 'X';
      const score = this.minimax(!maximizing, depth + 1);
      this.board[row][col] = '';
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  boardWinner(): string | null {
    const lines = [
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
    ];
    for (const line of lines) {
      const [a,b,c] = line;
      const value = this.board[a[0]][a[1]];
      if (value && value === this.board[b[0]][b[1]] && value === this.board[c[0]][c[1]]) return value;
    }
    return null;
  }

  findWinningMove(player: string): {row: number, col: number} | null {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          this.board[i][j] = player;
          if (this.checkWinner()) {
            this.board[i][j] = '';
            return {row: i, col: j};
          }
          this.board[i][j] = '';
        }
      }
    }
    return null;
  }

  getRandomMove(): {row: number, col: number} | null {
    const availableMoves: {row: number, col: number}[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          availableMoves.push({row: i, col: j});
        }
      }
    }
    return availableMoves.length > 0 ? 
           availableMoves[Math.floor(Math.random() * availableMoves.length)] : null;
  }

  checkWinner(): boolean {
    // Verificar filas
    for (let i = 0; i < 3; i++) {
      if (this.board[i][0] && this.board[i][0] === this.board[i][1] && this.board[i][0] === this.board[i][2]) {
        this.winningCells = [[i,0], [i,1], [i,2]];
        return true;
      }
    }
    
    // Verificar columnas
    for (let i = 0; i < 3; i++) {
      if (this.board[0][i] && this.board[0][i] === this.board[1][i] && this.board[0][i] === this.board[2][i]) {
        this.winningCells = [[0,i], [1,i], [2,i]];
        return true;
      }
    }
    
    // Verificar diagonales
    if (this.board[0][0] && this.board[0][0] === this.board[1][1] && this.board[0][0] === this.board[2][2]) {
      this.winningCells = [[0,0], [1,1], [2,2]];
      return true;
    }
    if (this.board[0][2] && this.board[0][2] === this.board[1][1] && this.board[0][2] === this.board[2][0]) {
      this.winningCells = [[0,2], [1,1], [2,0]];
      return true;
    }
    
    return false;
  }

  isWinningCell(row: number, col: number): boolean {
    return this.winningCells.some(cell => cell[0] === row && cell[1] === col);
  }

  isBoardFull(): boolean {
    return this.board.every(row => row.every(cell => cell !== ''));
  }

  createParticleEffect(row: number, col: number, emoji: string) {
    const particles: Particle[] = [];
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: (col * 120) + 60 + (Math.random() - 0.5) * 40,
        y: (row * 120) + 60 + (Math.random() - 0.5) * 40,
        emoji: emoji,
        delay: i * 100
      });
    }
    this.particles = particles;
    this.showParticles = true;
    
    setTimeout(() => {
      this.showParticles = false;
    }, 1000);
  }

  celebrateWin() {
    const celebrationEmojis = ['🎉', '✨', '🎆', '🏆', '😄'];
    const particles: Particle[] = [];
    
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
        delay: i * 50
      });
    }
    
    this.particles = particles;
    this.showParticles = true;
    
    setTimeout(() => {
      this.showParticles = false;
    }, 3000);
  }
}
