import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, signal, ViewChildren } from '@angular/core';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
  position: 'left' | 'right';
  visible: boolean;
}

@Component({
  selector: 'app-history',
  templateUrl: 'history.html',
  styleUrl: 'history.scss'
})

export class historyComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;

  // Señal con los eventos de la historia
  timelineEvents = signal<TimelineEvent[]>([
    {
      year: '2023',
      title: 'Nos hicimos Novios',
      description: 'En un Concierto Gospel en Bogotá, simplemente se dió el momento, Diego sacó un anillo y pidió que fuera su novia.',
      icon: '💫',
      position: 'left',
      visible: false
    },
    {
      year: '2024 - 2025',
      title: 'Viajes',
      description: 'En nuestra historia de amor hemos tenido la oportunidad de viajar por varias ciudades y hemos recolectado momentos únicos',
      icon: '❤️',
      position: 'right',
      visible: false
    },
    {
      year: '2025',
      title: '¡Él propuso!',
      description: 'Quería sorprenderlo con una celebración de cumpleaños, pero... Diego se arrodilló y pidió mi mano. Por supuesto, ¡dije que sí! Fue el momento más hermoso de nuestras vidas.',
      icon: '💍',
      position: 'left',
      visible: false
    }
  ]);

  private observer: IntersectionObserver | null = null;

  constructor() { }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const index = parseInt(element.getAttribute('data-index') || '0', 10);

          // Actualizar la señal para marcar el evento como visible
          this.timelineEvents.update(events => {
            const updatedEvents = [...events];
            if (updatedEvents[index]) {
              updatedEvents[index] = { ...updatedEvents[index], visible: true };
            }
            return updatedEvents;
          });

          // Opcionalmente, dejar de observar el elemento una vez visible
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    // Observar todos los elementos del timeline
    this.timelineItems.forEach(item => {
      this.observer?.observe(item.nativeElement);
    });
  }

  // TrackBy para optimización
  trackByIndex(index: number, item: TimelineEvent): string {
    return `${item.year}-${index}`;
  }

  // Helper para determinar si es posición izquierda
  isLeftPosition(position: string): boolean {
    return position === 'left';
  }
}
