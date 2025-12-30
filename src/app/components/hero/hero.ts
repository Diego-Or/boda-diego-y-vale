// videoUrl: 'https://invitacion-dyv.netlify.app/video/hero-video.mp4',
// videoPoster: 'https://invitacion-dyv.netlify.app/images/thumbnail.png',

// hero.component.ts
import { Component, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HeroData {
  groomName: string;
  brideName: string;
  weddingDate: Date;
  welcomeMessage: string;
  videoUrl: string;
  videoPoster?: string; // Imagen de respaldo mientras carga el video
  ctaButtonText: string;
  ctaButtonLink: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss']
})
export class heroComponent implements OnInit, OnDestroy {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  // Señal con los datos del hero
  heroData = signal<HeroData>({
    groomName: 'Diego',
    brideName: 'Vale',
    weddingDate: new Date('2026-05-02T14:00:00'),
    welcomeMessage: 'Con alegría en nuestros corazones, te invitamos a ser parte del día más especial de nuestras vidas. Celebremos juntos el amor, la familia y el inicio de una nueva aventura.',
    videoUrl: 'https://invitacion-dyv.netlify.app/video/hero-video.mp4',
    videoPoster: 'https://invitacion-dyv.netlify.app/images/thumbnail.png',
    ctaButtonText: 'Comenzar a explorar',
    ctaButtonLink: '#historia'
  });

  // Señal para el countdown
  countdown = signal<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Señal para controlar si el video está cargado
  isVideoLoaded = signal<boolean>(false);

  // Señal para controlar si el video tiene error
  hasVideoError = signal<boolean>(false);

  // Señal para mostrar botón de play manual
  showPlayButton = signal<boolean>(false);

  // Computed signal para la fecha formateada
  formattedDate = computed(() => {
    const date = this.heroData().weddingDate;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  // Computed signal para nombres unidos
  coupleNames = computed(() => {
    return `${this.heroData().groomName} & ${this.heroData().brideName}`;
  });

  // Computed signal para verificar si la fecha ya pasó
  isWeddingDay = computed(() => {
    const now = new Date().getTime();
    const weddingTime = this.heroData().weddingDate.getTime();
    return now >= weddingTime;
  });

  private intervalId?: number;

  ngOnInit(): void {
    this.startCountdown();

    // Forzar reproducción del video después de que se cargue la vista
    setTimeout(() => {
      this.playVideo();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Forzar reproducción del video
  playVideo(): void {
    if (this.heroVideo?.nativeElement) {
      const video = this.heroVideo.nativeElement;

      // Asegurar que está muted
      video.muted = true;
      video.volume = 0;

      video.play()
        .then(() => {

          this.showPlayButton.set(false);
          this.isVideoLoaded.set(true);
        })
        .catch(error => {

          // Mostrar botón de play para que el usuario inicie manualmente
          this.showPlayButton.set(true);
          this.isVideoLoaded.set(false);
        });
    }
  }

  // Método cuando el usuario hace clic en el botón play
  onUserClickPlay(): void {
    this.playVideo();
    // También intentar con interacción del usuario
    if (this.heroVideo?.nativeElement) {
      this.heroVideo.nativeElement.muted = true;
      this.heroVideo.nativeElement.play();
    }
  }

  // Método cuando el video se carga exitosamente
  onVideoLoaded(): void {
    this.isVideoLoaded.set(true);

    this.playVideo();
  }

  // Método cuando el video puede reproducirse
  onVideoCanPlay(): void {

    this.playVideo();
  }
  private startCountdown(): void {
    this.updateCountdown();
    this.intervalId = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  // Actualizar los valores del countdown
  private updateCountdown(): void {
    const now = new Date().getTime();
    const weddingTime = this.heroData().weddingDate.getTime();
    const distance = weddingTime - now;

    if (distance < 0) {
      this.countdown.set({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.countdown.set({ days, hours, minutes, seconds });
  }

  // Método para navegar suavemente
  scrollToSection(event: Event, target: string): void {
    event.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Método cuando hay error en la carga del video
  onVideoError(): void {
    this.hasVideoError.set(true);

  }

  // Método para reintentar cargar el video
  retryVideoLoad(): void {
    this.hasVideoError.set(false);
    this.isVideoLoaded.set(false);
    if (this.heroVideo?.nativeElement) {
      this.heroVideo.nativeElement.load();
    }
  }

  // Método para formatear números con ceros a la izquierda
  formatNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
