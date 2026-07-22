import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Pokemon {
  id: number;
  name: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memorice',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './memorice.component.html',
  styleUrls: ['./memorice.component.css']
})
export class MemoriceComponent implements OnInit, OnDestroy {
  cards: Pokemon[] = [];
  flippedCards: number[] = [];
  matchedCards: number[] = [];
  gameWon: boolean = false;
  loading: boolean = false;
  
  // Estadísticas
  score: number = 0;
  moves: number = 0;
  timeElapsed: number = 0;
  gameTimer: any;
  startTime: number = 0;
  
  // Dificultad
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  gridSizes = {
    easy: { pairs: 6, cols: 3, rows: 4 },
    medium: { pairs: 8, cols: 4, rows: 4 },
    hard: { pairs: 10, cols: 5, rows: 4 }
  };
  
  // Pokémon locales como fallback
  localPokemon: any[] = [
    { id: 1, name: 'Bulbasaur', image: 'assets/images/0001.png' },
    { id: 25, name: 'Pikachu', image: 'assets/images/0014.png' },
    { id: 4, name: 'Charmander', image: 'assets/images/0030.png' },
    { id: 7, name: 'Squirtle', image: 'assets/images/0049.png' },
    { id: 150, name: 'Mewtwo', image: 'assets/images/0055.png' },
    { id: 6, name: 'Charizard', image: 'assets/images/0081.png' },
    { id: 9, name: 'Blastoise', image: 'assets/images/0090.png' },
    { id: 3, name: 'Venusaur', image: 'assets/images/0110.png' },
    { id: 144, name: 'Articuno', image: 'assets/images/0141.png' },
    { id: 19, name: 'Rattata', image: 'assets/images/0019.png' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializeGame();
  }

  ngOnDestroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  async initializeGame() {
    this.loading = true;
    this.resetStats();
    
    try {
      const pokemon = await this.getPokemonData();
      this.createCards(pokemon);
    } catch (error) {
      console.log('Usando Pokémon locales');
      this.createCards(this.localPokemon);
    }
    
    this.loading = false;
    this.startTimer();
  }

  async getPokemonData(): Promise<any[]> {
    const pairsNeeded = this.gridSizes[this.difficulty].pairs;
    const pokemon = [];
    
    for (let i = 0; i < pairsNeeded; i++) {
      const randomId = Math.floor(Math.random() * 150) + 1;
      try {
        const response: any = await this.http.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`).toPromise();
        pokemon.push({
          id: response.id,
          name: response.name.charAt(0).toUpperCase() + response.name.slice(1),
          image: response.sprites.other['official-artwork'].front_default || response.sprites.front_default
        });
      } catch {
        // Si falla, usar uno local
        pokemon.push(this.localPokemon[i % this.localPokemon.length]);
      }
    }
    
    return pokemon;
  }

  createCards(pokemon: any[]) {
    const doubledPokemon = [...pokemon, ...pokemon];
    this.cards = doubledPokemon.map((poke, index) => ({
      id: poke.id,
      name: poke.name,
      image: poke.image,
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

    if (selectedCard.flipped || this.matchedCards.includes(index) || this.flippedCards.length >= 2) {
      return;
    }

    selectedCard.flipped = true;
    this.flippedCards.push(index);
    this.moves++;

    if (this.flippedCards.length === 2) {
      setTimeout(() => this.checkMatch(), 800);
    }
  }

  checkMatch() {
    const [firstIndex, secondIndex] = this.flippedCards;
    const firstCard = this.cards[firstIndex];
    const secondCard = this.cards[secondIndex];

    if (firstCard.id === secondCard.id) {
      this.matchedCards.push(firstIndex, secondIndex);
      this.score += 100;
      
      if (this.matchedCards.length === this.cards.length) {
        this.gameWon = true;
        this.stopTimer();
        this.calculateFinalScore();
      }
    } else {
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
      }, 500);
    }
    this.flippedCards = [];
  }

  changeDifficulty(newDifficulty: 'easy' | 'medium' | 'hard') {
    this.difficulty = newDifficulty;
    this.initializeGame();
  }

  newRandomGame() {
    this.initializeGame();
  }

  resetGame() {
    this.createCards(this.cards.slice(0, this.gridSizes[this.difficulty].pairs).map(card => ({
      id: card.id,
      name: card.name,
      image: card.image
    })));
    this.resetStats();
    this.startTimer();
  }

  resetStats() {
    this.score = 0;
    this.moves = 0;
    this.timeElapsed = 0;
    this.stopTimer();
  }

  startTimer() {
    this.startTime = Date.now();
    this.gameTimer = setInterval(() => {
      this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  stopTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  calculateFinalScore() {
    const timeBonus = Math.max(0, 300 - this.timeElapsed);
    const moveBonus = Math.max(0, (this.gridSizes[this.difficulty].pairs * 2 - this.moves) * 10);
    this.score += timeBonus + moveBonus;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getPerformanceMessage(): string {
    const efficiency = this.score / Math.max(this.moves, 1);
    if (efficiency > 50) return '🎆 ¡MAESTRO POKÉMON!';
    if (efficiency > 30) return '🎉 ¡EXCELENTE ENTRENADOR!';
    if (efficiency > 20) return '😊 ¡BUEN TRABAJO!';
    return '💪 ¡Sigue practicando!';
  }
}
