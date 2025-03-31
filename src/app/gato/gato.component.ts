import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  currentPlayer: string = 'X'; // 'X' o 'O'
  winner: string | null = null; // Puede ser 'X', 'O' o null
  isDraw: boolean = false; // Nuevo indicador de empate
  isPlayerTurn: boolean = true; // Nuevo indicador para habilitar/deshabilitar turnos del jugador

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
    this.isPlayerTurn = true; // Habilita el turno del jugador al reiniciar el juego
  }

  play(row: number, col: number) {
    if (this.isPlayerTurn && this.board[row][col] === '' && this.winner === null && !this.isDraw) {
      this.board[row][col] = this.currentPlayer;
      this.isPlayerTurn = false; // Deshabilita turnos adicionales del jugador

      if (this.checkWinner()) {
        this.winner = this.currentPlayer;
      } else if (this.isBoardFull()) {
        this.isDraw = true;
      } else {
        this.currentPlayer = 'O';
        setTimeout(() => {
          this.computerMove();
        }, 500); // Retraso de 1/2 segundo (500 ms)
      }
    }
  }

  computerMove() {
    const availableMoves: { row: number, col: number }[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          availableMoves.push({ row: i, col: j });
        }
      }
    }

    if (availableMoves.length > 0) {
      const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      this.board[move.row][move.col] = 'O';

      if (this.checkWinner()) {
        this.winner = 'O';
      } else if (this.isBoardFull()) {
        this.isDraw = true;
      } else {
        this.currentPlayer = 'X';
        this.isPlayerTurn = true; // Habilita el turno del jugador después del turno del computador
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

  isBoardFull(): boolean {
    for (let row of this.board) {
      if (row.includes('')) {
        return false;
      }
    }
    return true;
  }
}
