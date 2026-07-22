import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit, OnDestroy {
  snake: Position[] = [{x: 10, y: 10}];
  food: Position = {x: 15, y: 15};
  direction: Position = {x: 0, y: -1};
  gameRunning = false;
  score = 0;
  highScore = 0;
  gameInterval: any;
  gridSize = 20;
  gameSpeed = 150;

  ngOnInit() {
    this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    this.generateFood();
  }

  ngOnDestroy() {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (!this.gameRunning) return;
    
    switch(event.key) {
      case 'ArrowUp':
        if (this.direction.y === 0) this.direction = {x: 0, y: -1};
        break;
      case 'ArrowDown':
        if (this.direction.y === 0) this.direction = {x: 0, y: 1};
        break;
      case 'ArrowLeft':
        if (this.direction.x === 0) this.direction = {x: -1, y: 0};
        break;
      case 'ArrowRight':
        if (this.direction.x === 0) this.direction = {x: 1, y: 0};
        break;
    }
  }

  startGame() {
    this.snake = [{x: 10, y: 10}];
    this.direction = {x: 0, y: -1};
    this.score = 0;
    this.gameRunning = true;
    this.generateFood();
    
    this.gameInterval = setInterval(() => {
      this.moveSnake();
    }, this.gameSpeed);
  }

  stopGame() {
    this.gameRunning = false;
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
  }

  moveSnake() {
    const head = {...this.snake[0]};
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
      this.stopGame();
      return;
    }
    
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.stopGame();
      return;
    }
    
    this.snake.unshift(head);
    
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.generateFood();
      if (this.gameSpeed > 80) {
        this.gameSpeed -= 2;
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => {
          this.moveSnake();
        }, this.gameSpeed);
      }
    } else {
      this.snake.pop();
    }
  }

  generateFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize)
      };
    } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
  }

  changeDirection(newDirection: Position) {
    if (!this.gameRunning) return;
    
    if ((this.direction.x === 0 && newDirection.x === 0) || 
        (this.direction.y === 0 && newDirection.y === 0)) {
      return;
    }
    
    this.direction = newDirection;
  }

  getCellClass(x: number, y: number): string {
    if (this.snake.some(segment => segment.x === x && segment.y === y)) {
      return this.snake[0].x === x && this.snake[0].y === y ? 'snake-head' : 'snake-body';
    }
    if (this.food.x === x && this.food.y === y) {
      return 'food';
    }
    return 'empty';
  }

  getGrid(): number[][] {
    const grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      const row = [];
      for (let x = 0; x < this.gridSize; x++) {
        row.push(1);
      }
      grid.push(row);
    }
    return grid;
  }
}