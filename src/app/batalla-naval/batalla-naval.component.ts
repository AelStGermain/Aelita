import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cell {
  x: number;
  y: number;
  hasShip: boolean;
  hit: boolean;
  status: 'empty' | 'ship' | 'hit' | 'miss';
}

interface Ship {
  name: string;
  size: number;
  hits: number;
}

@Component({
  selector: 'app-batalla-naval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './batalla-naval.component.html',
  styleUrls: ['./batalla-naval.component.css']
})
export class BatallaNavalComponent implements OnInit {
  boardSize = 10;
  playerBoard: Cell[][] = [];
  cpuBoard: Cell[][] = [];

  playerShips: Ship[] = [];
  cpuShips: Ship[] = [];

  gameStatus: 'setup' | 'playing' | 'won' | 'lost' = 'setup';
  private cpuTargets: {x: number, y: number}[] = [];
  message: string = '¡Bienvenido a Batalla Naval! Presiona "Iniciar Juego"';

  constructor() { }

  ngOnInit(): void {
    this.initializeGame();
  }

  initializeGame() {
    this.cpuTargets = [];
    this.playerBoard = this.createBoard();
    this.cpuBoard = this.createBoard();
    this.placeShips(this.playerBoard, this.playerShips);
    this.placeShips(this.cpuBoard, this.cpuShips);
    this.gameStatus = 'playing';
    this.message = 'Tu turno: Ataca una casilla enemiga.';
  }

  createBoard(): Cell[][] {
    const board = [];
    for (let y = 0; y < this.boardSize; y++) {
      const row = [];
      for (let x = 0; x < this.boardSize; x++) {
        row.push({ x, y, hasShip: false, hit: false, status: 'empty' } as Cell);
      }
      board.push(row);
    }
    return board;
  }

  placeShips(board: Cell[][], shipList: Ship[]) {
    // Reset ships
    shipList.length = 0;
    const shipsToPlace = [
      { name: 'Portaaviones', size: 5 },
      { name: 'Acorazado', size: 4 },
      { name: 'Crucero', size: 3 },
      { name: 'Submarino', size: 3 },
      { name: 'Destructor', size: 2 }
    ];

    shipsToPlace.forEach(shipTemplate => {
      let placed = false;
      while (!placed) {
        const horizontal = Math.random() > 0.5;
        const x = Math.floor(Math.random() * this.boardSize);
        const y = Math.floor(Math.random() * this.boardSize);

        if (this.canPlaceShip(board, x, y, shipTemplate.size, horizontal)) {
          this.placeShipOnBoard(board, x, y, shipTemplate.size, horizontal);
          shipList.push({ ...shipTemplate, hits: 0 });
          placed = true;
        }
      }
    });
  }

  canPlaceShip(board: Cell[][], x: number, y: number, size: number, horizontal: boolean): boolean {
    if (horizontal) {
      if (x + size > this.boardSize) return false;
      for (let i = 0; i < size; i++) {
        if (board[y][x + i].hasShip) return false;
      }
    } else {
      if (y + size > this.boardSize) return false;
      for (let i = 0; i < size; i++) {
        if (board[y + i][x].hasShip) return false;
      }
    }
    return true;
  }

  placeShipOnBoard(board: Cell[][], x: number, y: number, size: number, horizontal: boolean) {
    if (horizontal) {
      for (let i = 0; i < size; i++) {
        board[y][x + i].hasShip = true;
        board[y][x + i].status = 'ship'; // Visible for player, hidden for CPU in view logic
      }
    } else {
      for (let i = 0; i < size; i++) {
        board[y + i][x].hasShip = true;
        board[y + i][x].status = 'ship';
      }
    }
  }

  playerAttack(x: number, y: number) {
    if (this.gameStatus !== 'playing') return;

    const cell = this.cpuBoard[y][x];
    if (cell.hit) return; // Already hit

    cell.hit = true;
    if (cell.hasShip) {
      cell.status = 'hit';
      this.message = '¡IMPACTO! Has dado a un barco enemigo.';
      this.checkWinCondition();
    } else {
      cell.status = 'miss';
      this.message = 'Agua... Turno del enemigo.';
      setTimeout(() => this.cpuTurn(), 1000);
    }
  }

  cpuTurn() {
    if (this.gameStatus !== 'playing') return;

    const move = this.nextCpuMove();
    const x = move.x;
    const y = move.y;

    const cell = this.playerBoard[y!][x!];
    cell.hit = true;

    if (cell.hasShip) {
      cell.status = 'hit'; // Visual update for player board
      this.message = '¡ALERTA! El enemigo ha impactado tu barco.';
      this.checkLossCondition();
      this.queueAdjacentTargets(x, y);
      // CPU gets another turn on hit? Let's keep it simple: strict turns for now unless requested otherwise
      setTimeout(() => this.cpuTurn(), 1000);
    } else {
      cell.status = 'miss'; // Visual update
      this.message = 'El enemigo ha fallado. Tu turno.';
    }
  }

  private nextCpuMove(): {x: number, y: number} {
    while (this.cpuTargets.length) {
      const target = this.cpuTargets.shift()!;
      if (!this.playerBoard[target.y][target.x].hit) return target;
    }
    const parityMoves: {x:number,y:number}[] = [];
    const fallback: {x:number,y:number}[] = [];
    for (let y=0;y<this.boardSize;y++) for(let x=0;x<this.boardSize;x++) {
      if (!this.playerBoard[y][x].hit) ((x+y)%2===0 ? parityMoves : fallback).push({x,y});
    }
    const choices = parityMoves.length ? parityMoves : fallback;
    return choices[Math.floor(Math.random()*choices.length)];
  }

  private queueAdjacentTargets(x:number,y:number) {
    const neighbors=[{x:x+1,y},{x:x-1,y},{x,y:y+1},{x,y:y-1}]
      .filter(p=>p.x>=0&&p.y>=0&&p.x<this.boardSize&&p.y<this.boardSize&&!this.playerBoard[p.y][p.x].hit);
    this.cpuTargets = [...neighbors, ...this.cpuTargets.filter(t=>!neighbors.some(n=>n.x===t.x&&n.y===t.y))];
  }

  checkWinCondition() {
    let allSunk = true;
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (this.cpuBoard[y][x].hasShip && !this.cpuBoard[y][x].hit) {
          allSunk = false;
          break;
        }
      }
    }
    if (allSunk) {
      this.gameStatus = 'won';
      this.message = '¡VICTORIA! Has hundido toda la flota enemiga.';
    }
  }

  checkLossCondition() {
    let allSunk = true;
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (this.playerBoard[y][x].hasShip && !this.playerBoard[y][x].hit) {
          allSunk = false;
          break;
        }
      }
    }
    if (allSunk) {
      this.gameStatus = 'lost';
      this.message = 'DERROTA... Tu flota ha sido destruida.';
    }
  }

  restartGame() {
    this.initializeGame();
  }
}
