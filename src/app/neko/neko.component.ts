import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NekoService } from '../neko.service';

@Component({
  selector: 'app-neko',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neko.component.html',
  styleUrls: ['./neko.component.css']
})
export class NekoComponent implements OnInit, OnDestroy {
  @Input() mouseX = 0;
  @Input() mouseY = 0;

  nekoX = window.innerWidth / 2 || 100;
  nekoY = window.innerHeight / 2 || 100;
  speed = 4;
  state: 'idle' | 'running' | 'sleeping' = 'idle';
  facingRight = true;

  private animationFrameId: number = 0;
  private lastActivityTime: number = Date.now();

  constructor(public nekoService: NekoService) {}

  ngOnInit() {
    this.updateLoop();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private updateLoop = () => {
    if (typeof window === 'undefined') return;
    
    const dx = this.mouseX - this.nekoX;
    const dy = this.mouseY - this.nekoY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;

    if (distance > 50) {
      this.state = 'running';
      this.nekoX += (dx / distance) * this.speed;
      this.nekoY += (dy / distance) * this.speed;
      this.facingRight = dx > 0;
      this.lastActivityTime = Date.now();
    } else {
      if (timeSinceLastActivity > 15000) {
        this.state = 'sleeping';
      } else {
        this.state = 'idle';
      }
    }

    this.animationFrameId = requestAnimationFrame(this.updateLoop);
  }

  public onNekoClick() {
    this.nekoService.addExp(2);
    const msgs = [
      '¡Miau!',
      'Miau miau... (Traducción: ' + this.nekoService.lastActivityDesc + ')',
      'Purrrr...'
    ];
    alert(msgs[Math.floor(Math.random() * msgs.length)]);
  }
}
