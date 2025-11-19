import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class heroComponent {

  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);
  distance = signal(1);

  constructor (){

    const updateCountdown = () => {
      const weddingDate = new Date('2026-04-15T17:00:00').getTime();
      const now = new Date().getTime();
      const distance = weddingDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // document.getElementById('days').textContent = days;

      this.days.set(days);
      this.hours.set(hours);
      this.minutes.set(minutes);
      this.seconds.set(seconds);
      this.distance.set(distance);

    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

  }





}
