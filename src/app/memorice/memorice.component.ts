import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memorice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memorice.component.html',
  styleUrls: ['./memorice.component.css']
})
export class MemoriceComponent implements OnInit {
  cards: any[] = [];
  flippedCards: number[] = [];
  matchedCards: number[] = [];
  gameWon: boolean = false;

  images: string[] = [
    'assets/images/0001.png',
    'assets/images/0014.png',
    'assets/images/0030.png',
    'assets/images/0049.png',
    'assets/images/0055.png',
    'assets/images/0081.png',
    'assets/images/0090.png',
    'assets/images/0110.png',
    'assets/images/0141.png',
    'assets/images/0019.png'
  ];

  ngOnInit() {
    this.initializeGame();
  }

  initializeGame() {
    const doubledImages = [...this.images, ...this.images];
    this.cards = doubledImages.map((image, index) => ({
      id: index,
      image: image,
      flipped: false,
      matched: false
    }));
    this.shuffleCards();
    this.flippedCards = [];
    this.matchedCards = [];
    this.gameWon = false;
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  flipCard(index: number) {
    const selectedCard = this.cards[index];

    if (selectedCard.flipped || this.matchedCards.includes(index)) {
      return;
    }

    selectedCard.flipped = true;
    this.flippedCards.push(index);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    const [firstIndex, secondIndex] = this.flippedCards;
    const firstCard = this.cards[firstIndex];
    const secondCard = this.cards[secondIndex];

    if (firstCard.image === secondCard.image) {
      this.matchedCards.push(firstIndex, secondIndex);
      if (this.matchedCards.length === this.cards.length) {
        this.gameWon = true;
      }
    } else {
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 1000);
    }
    this.flippedCards = [];
  }

  resetGame() {
    this.initializeGame();
  }
}
