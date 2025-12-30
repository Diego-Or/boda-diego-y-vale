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
    weddingDate: new Date('2026-06-15T17:00:00'),
    welcomeMessage: 'Con alegría en nuestros corazones, te invitamos a ser parte del día más especial de nuestras vidas. Celebremos juntos el amor, la familia y el inicio de una nueva aventura.',
    videoUrl: 'video/hero-video.mp4',
    videoPoster: 'video/thumbnail.png',
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
      video.play().catch(error => {
        console.log('Error al reproducir video automáticamente:', error);
        // Si falla el autoplay, el poster se mantiene visible
      });
    }
  }

  // Método cuando el video puede reproducirse
  onVideoCanPlay(): void {
    console.log('Video listo para reproducir');
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

  // Método cuando el video se carga exitosamente
  onVideoLoaded(): void {
    this.isVideoLoaded.set(true);
    console.log('Video cargado exitosamente');
  }

  // Método cuando hay error en la carga del video
  onVideoError(): void {
    this.hasVideoError.set(true);
    console.error('Error al cargar el video');
  }

  // Método para reintentar cargar el video
  retryVideoLoad(): void {
    this.hasVideoError.set(false);
    this.isVideoLoaded.set(false);
    if (this.heroVideo?.nativeElement) {
      this.heroVideo.nativeElement.load();
    }
  }

  // Método para actualizar datos del hero
  updateHeroData(newData: Partial<HeroData>): void {
    this.heroData.update(current => ({
      ...current,
      ...newData
    }));
  }

  // Método para formatear números con ceros a la izquierda
  formatNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}

// EJEMPLO DE VIDEOS GRATUITOS PARA USAR:
/*
Videos de bodas gratuitos de Coverr.co:
1. https://cdn.coverr.co/videos/coverr-wedding-couple-walking-in-nature-6245/1080p.mp4
2. https://cdn.coverr.co/videos/coverr-wedding-rings-5856/1080p.mp4
3. https://cdn.coverr.co/videos/coverr-bride-and-groom-7394/1080p.mp4

Videos de Pexels (necesitan descargarse primero):
- https://www.pexels.com/search/videos/wedding/

Actualizar en el componente:
this.updateHeroData({
  videoUrl: 'tu-video-url.mp4',
  videoPoster: 'tu-imagen-poster.jpg'
});
*/
