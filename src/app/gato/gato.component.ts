import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-gato',
  standalone: true,
  imports: [CommonModule],  // Aquí agregas CommonModule
  templateUrl: './gato.component.html',
  styleUrls: ['./gato.component.css'],
})
export class GatoComponent {
  board: string[][] = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];
  currentPlayer: string = 'X';  // 'X' o 'O'
  winner: string | null = null;  // Puede ser 'X', 'O' o null

  constructor() {
    this.resetGame();
  }

  resetGame() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.currentPlayer = 'X';
    this.winner = null;
  }

  play(row: number, col: number) {
    if (this.board[row][col] === '' && this.winner === null) {
      this.board[row][col] = this.currentPlayer;
      if (this.checkWinner()) {
        this.winner = this.currentPlayer;
      } else {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  }

  checkWinner(): boolean {
    for (let i = 0; i < 3; i++) {
      if (this.board[i][0] && this.board[i][0] === this.board[i][1] && this.board[i][0] === this.board[i][2]) {
        return true;
      }
      if (this.board[0][i] && this.board[0][i] === this.board[1][i] && this.board[0][i] === this.board[2][i]) {
        return true;
      }
    }
    if (this.board[0][0] && this.board[0][0] === this.board[1][1] && this.board[0][0] === this.board[2][2]) {
      return true;
    }
    if (this.board[0][2] && this.board[0][2] === this.board[1][1] && this.board[0][2] === this.board[2][0]) {
      return true;
    }
    return false;
  }
}
