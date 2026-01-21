import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, signal, ViewChildren } from '@angular/core';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
  position: 'left' | 'right';
  visible: boolean;
  photo: string;
  photoAlt: string;
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
      title: 'El Noviazgo',
      description: 'El 6 de agosto de 2023, en medio de la música y la emoción de un concierto góspel, todo se dio a la perfección. ¡nos hicimos novios!',
      icon: '💫',
      position: 'left',
      visible: false,
      photo: './images/2022.png',
      photoAlt: ''
    },
    {
      year: '2024 - 2025',
      title: 'Nuestro viaje',
      description: 'En nuestra historia de amor hemos guardando recuerdos únicos y hemos podido crecer juntos. En cada paso hemos aprendido el uno del otro y confirmado que Dios nos unió con un propósito especial.',
      icon: '❤️',
      position: 'right',
      visible: false,
      photo: './images/viajes.png',
      photoAlt: ''
    },
    {
      year: '2025',
      title: '¡La propuesta!',
      description: 'Quería sorprenderlo con una celebración de cumpleaños, pero la sorpresa fue para mí. Diego se arrodilló y me pidió la mano. Sin dudarlo, dije que sí. Fue uno de los momentos más hermosos de nuestras vidas.',
      icon: '💍',
      position: 'left',
      visible: false,
      photo: './images/propuesta.jpeg',
      photoAlt: ''
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
