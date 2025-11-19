import { Component, ElementRef, QueryList, signal, ViewChildren} from '@angular/core';

interface EventDetail {
  icon: string;
  label: string;
  value: string;
}

interface EventCard {
  icon: string;
  title: string;
  details: EventDetail[];
  visible: boolean;
}

@Component({
  selector: 'app-details',
  templateUrl: 'details.html',
  styleUrl: 'details.scss'
})

export class detailsComponent {
  @ViewChildren('eventCard') eventCards!: QueryList<ElementRef>;

  // Señal con los detalles de los eventos
  events = signal<EventCard[]>([
    {
      icon: '⛪',
      title: 'Ceremonia',
      details: [
        { icon: '📅', label: 'Fecha', value: 'xx de xxxxx, 2026' },
        { icon: '🕐', label: 'Hora', value: 'xxxx PM' },
        { icon: '📍', label: 'Lugar', value: 'xxxxxxxxxxxx, xxxxxx' }
      ],
      visible: false
    },
    {
      icon: '🎉',
      title: 'Recepción',
      details: [
        { icon: '📅', label: 'Fecha', value: 'xx de xxxxx, 2026' },
        { icon: '🕗', label: 'Hora', value: 'xxxx PM' },
        { icon: '📍', label: 'Lugar', value: 'xxxxxxxxxxxx, xxxxxx' }
      ],
      visible: false
    }
  ]);

  private observer: IntersectionObserver | null = null;

  constructor() {}

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

          // Actualizar la señal para marcar la tarjeta como visible
          this.events.update(events => {
            const updatedEvents = [...events];
            if (updatedEvents[index]) {
              updatedEvents[index] = { ...updatedEvents[index], visible: true };
            }
            return updatedEvents;
          });

          // Dejar de observar después de hacerse visible
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    // Observar todas las tarjetas de eventos
    this.eventCards.forEach(card => {
      this.observer?.observe(card.nativeElement);
    });
  }

  // Método para actualizar un evento específico
  updateEvent(index: number, updates: Partial<EventCard>): void {
    this.events.update(events => {
      const updatedEvents = [...events];
      if (updatedEvents[index]) {
        updatedEvents[index] = { ...updatedEvents[index], ...updates };
      }
      return updatedEvents;
    });
  }

  // Método para actualizar un detalle específico
  updateEventDetail(eventIndex: number, detailIndex: number, value: string): void {
    this.events.update(events => {
      const updatedEvents = [...events];
      if (updatedEvents[eventIndex] && updatedEvents[eventIndex].details[detailIndex]) {
        const updatedDetails = [...updatedEvents[eventIndex].details];
        updatedDetails[detailIndex] = { ...updatedDetails[detailIndex], value };
        updatedEvents[eventIndex] = {
          ...updatedEvents[eventIndex],
          details: updatedDetails
        };
      }
      return updatedEvents;
    });
  }

  // TrackBy para optimización
  trackByTitle(index: number, item: EventCard): string {
    return item.title;
  }

  trackByLabel(index: number, item: EventDetail): string {
    return item.label;
  }

}
